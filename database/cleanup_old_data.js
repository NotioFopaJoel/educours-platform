/**
 * cleanup_old_data.js
 * Script de nettoyage des vieilles données pour EduCours Platform
 * Usage: node cleanup_old_data.js [--dry-run] [--execute] [--help]
 */

const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '../backend/.env' });

// Configuration
const CONFIG = {
    // Retention periods (in days)
    RETENTION: {
        INACTIVE_USERS: 365,      // 1 an
        UNPUBLISHED_COURSES: 180, // 6 mois
        FAILED_PAYMENTS: 30,      // 1 mois
        OLD_LOGS: 90,             // 3 mois
        EXPIRED_SESSIONS: 7,      // 1 semaine
        TEMP_FILES: 1,            // 24 heures
    },

    // Limits
    MAX_FILE_SIZE_MB: 100,
    BATCH_SIZE: 1000,

    // Paths
    UPLOADS_DIR: path.join(__dirname, '../backend/uploads'),
    LOGS_DIR: path.join(__dirname, '../logs'),
};

// Modèles
let User, Course, Payment, Session, Log;

// Statistiques
let stats = {
    deleted: {
        users: 0,
        courses: 0,
        payments: 0,
        sessions: 0,
        files: 0,
    },
    scanned: 0,
    errors: 0,
    startTime: null,
    endTime: null,
};

// Options
let options = {
    dryRun: false,
    verbose: false,
    execute: false,
};

// Initialisation
async function init() {
    console.log('🚀 Initialisation du nettoyage de données...\n');

    // Charger les modèles
    try {
        User = require('../backend/src/models/User.model');
        Course = require('../backend/src/models/Course.model');
        Payment = require('../backend/src/models/Payment.model');

        // Modèles optionnels
        try {
            Session = require('../backend/src/models/Session.model');
        } catch (e) {
            console.log('⚠️  Modèle Session non trouvé, ignoré.');
        }
    } catch (error) {
        console.error('❌ Erreur chargement modèles:', error.message);
        process.exit(1);
    }

    // Connexion MongoDB
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/educours', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connecté à MongoDB');
    } catch (error) {
        console.error('❌ Erreur connexion MongoDB:', error.message);
        process.exit(1);
    }

    stats.startTime = new Date();
}

// Nettoyer utilisateurs inactifs
async function cleanInactiveUsers() {
    console.log('\n👥 Nettoyage des utilisateurs inactifs...');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CONFIG.RETENTION.INACTIVE_USERS);

    try {
        // Trouver les utilisateurs inactifs
        const inactiveUsers = await User.find({
            isActive: false,
            lastLogin: { $lt: cutoffDate },
            createdAt: { $lt: cutoffDate },
            role: { $in: ['student', 'teacher'] }, // Ne pas toucher aux admins
        }).limit(CONFIG.BATCH_SIZE);

        console.log(`   Trouvés: ${inactiveUsers.length} utilisateurs inactifs`);

        if (options.dryRun || !options.execute) {
            console.log('   DRY RUN: Aucun utilisateur supprimé');
            return;
        }

        // Supprimer les utilisateurs
        for (const user of inactiveUsers) {
            try {
                // Vérifier s'il n'a pas de cours actifs
                const activeCourses = await Course.countDocuments({
                    teacher: user._id,
                    isPublished: true,
                });

                const enrollments = await mongoose.connection.db.collection('enrollments').countDocuments({
                    studentId: user._id,
                });

                if (activeCourses === 0 && enrollments === 0) {
                    await user.deleteOne();
                    stats.deleted.users++;

                    if (options.verbose) {
                        console.log(`   ✓ Supprimé: ${user.email} (dernière connexion: ${user.lastLogin || 'jamais'})`);
                    }
                }
            } catch (error) {
                console.error(`   ✗ Erreur avec ${user.email}:`, error.message);
                stats.errors++;
            }
        }

        console.log(`   ✅ ${stats.deleted.users} utilisateurs supprimés`);
    } catch (error) {
        console.error('   ✗ Erreur:', error.message);
        stats.errors++;
    }
}

// Nettoyer cours non publiés
async function cleanUnpublishedCourses() {
    console.log('\n📚 Nettoyage des cours non publiés...');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CONFIG.RETENTION.UNPUBLISHED_COURSES);

    try {
        const unpublishedCourses = await Course.find({
            isPublished: false,
            isApproved: false,
            updatedAt: { $lt: cutoffDate },
            $or: [
                { totalStudents: 0 },
                { totalStudents: { $exists: false } }
            ]
        }).limit(CONFIG.BATCH_SIZE);

        console.log(`   Trouvés: ${unpublishedCourses.length} cours non publiés`);

        if (options.dryRun || !options.execute) {
            console.log('   DRY RUN: Aucun cours supprimé');
            return;
        }

        for (const course of unpublishedCourses) {
            try {
                // Vérifier s'il n'a pas d'étudiants
                const studentCount = await mongoose.connection.db.collection('enrollments').countDocuments({
                    courseId: course._id,
                });

                if (studentCount === 0) {
                    await course.deleteOne();
                    stats.deleted.courses++;

                    // Nettoyer les fichiers associés
                    await cleanCourseFiles(course._id);

                    if (options.verbose) {
                        console.log(`   ✓ Supprimé: ${course.title}`);
                    }
                }
            } catch (error) {
                console.error(`   ✗ Erreur avec ${course.title}:`, error.message);
                stats.errors++;
            }
        }

        console.log(`   ✅ ${stats.deleted.courses} cours supprimés`);
    } catch (error) {
        console.error('   ✗ Erreur:', error.message);
        stats.errors++;
    }
}

// Nettoyer paiements échoués
async function cleanFailedPayments() {
    console.log('\n💳 Nettoyage des paiements échoués...');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CONFIG.RETENTION.FAILED_PAYMENTS);

    try {
        const failedPayments = await Payment.find({
            status: { $in: ['failed', 'cancelled', 'expired'] },
            createdAt: { $lt: cutoffDate },
        }).limit(CONFIG.BATCH_SIZE);

        console.log(`   Trouvés: ${failedPayments.length} paiements échoués`);

        if (options.dryRun || !options.execute) {
            console.log('   DRY RUN: Aucun paiement supprimé');
            return;
        }

        for (const payment of failedPayments) {
            try {
                await payment.deleteOne();
                stats.deleted.payments++;

                if (options.verbose) {
                    console.log(`   ✓ Supprimé: Paiement ${payment._id} (${payment.status})`);
                }
            } catch (error) {
                console.error(`   ✗ Erreur avec paiement ${payment._id}:`, error.message);
                stats.errors++;
            }
        }

        console.log(`   ✅ ${stats.deleted.payments} paiements supprimés`);
    } catch (error) {
        console.error('   ✗ Erreur:', error.message);
        stats.errors++;
    }
}

// Nettoyer sessions expirées
async function cleanExpiredSessions() {
    if (!Session) {
        console.log('\n🔒 Sessions: Modèle non disponible, ignoré.');
        return;
    }

    console.log('\n🔒 Nettoyage des sessions expirées...');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CONFIG.RETENTION.EXPIRED_SESSIONS);

    try {
        const expiredSessions = await Session.find({
            expires: { $lt: cutoffDate },
        }).limit(CONFIG.BATCH_SIZE * 10); // Plus de sessions

        console.log(`   Trouvés: ${expiredSessions.length} sessions expirées`);

        if (options.dryRun || !options.execute) {
            console.log('   DRY RUN: Aucune session supprimée');
            return;
        }

        await Session.deleteMany({
            expires: { $lt: cutoffDate },
        });

        stats.deleted.sessions = expiredSessions.length;
        console.log(`   ✅ ${stats.deleted.sessions} sessions supprimées`);
    } catch (error) {
        console.error('   ✗ Erreur:', error.message);
        stats.errors++;
    }
}

// Nettoyer fichiers uploads
async function cleanOrphanedFiles() {
    console.log('\n📁 Nettoyage des fichiers orphelins...');

    try {
        // Récupérer tous les fichiers référencés dans la base
        const referencedFiles = await getReferencedFiles();

        // Scanner le dossier uploads
        const uploadsDir = CONFIG.UPLOADS_DIR;
        let filesDeleted = 0;

        async function scanDirectory(dir, basePath = '') {
            try {
                const items = await fs.readdir(dir, { withFileTypes: true });

                for (const item of items) {
                    const fullPath = path.join(dir, item.name);
                    const relativePath = path.join(basePath, item.name);

                    if (item.isDirectory()) {
                        await scanDirectory(fullPath, relativePath);
                    } else {
                        // Vérifier si le fichier est référencé
                        const isReferenced = referencedFiles.some(ref =>
                            ref.includes(item.name) || ref.includes(relativePath)
                        );

                        // Vérifier l'âge du fichier
                        const stats = await fs.stat(fullPath);
                        const fileAgeDays = (Date.now() - stats.mtime.getTime()) / (1000 * 3600 * 24);

                        if (!isReferenced && fileAgeDays > CONFIG.RETENTION.TEMP_FILES) {
                            if (options.dryRun || !options.execute) {
                                if (options.verbose) {
                                    console.log(`   DRY RUN: Supprimerait ${relativePath}`);
                                }
                            } else {
                                await fs.unlink(fullPath);
                                filesDeleted++;

                                if (options.verbose) {
                                    console.log(`   ✓ Supprimé: ${relativePath}`);
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                if (error.code !== 'ENOENT') {
                    console.error(`   ✗ Erreur scan ${dir}:`, error.message);
                    stats.errors++;
                }
            }
        }

        await scanDirectory(uploadsDir);
        stats.deleted.files = filesDeleted;
        console.log(`   ✅ ${filesDeleted} fichiers orphelins supprimés`);
    } catch (error) {
        console.error('   ✗ Erreur:', error.message);
        stats.errors++;
    }
}

// Récupérer les fichiers référencés
async function getReferencedFiles() {
    const referencedFiles = [];

    try {
        // Fichiers des cours
        const courses = await Course.find({}, 'thumbnail previewVideo');
        courses.forEach(course => {
            if (course.thumbnail?.url) referencedFiles.push(course.thumbnail.url);
            if (course.previewVideo?.url) referencedFiles.push(course.previewVideo.url);
        });

        // Fichiers des utilisateurs
        const users = await User.find({}, 'avatar');
        users.forEach(user => {
            if (user.avatar?.url) referencedFiles.push(user.avatar.url);
        });

        // Autres collections avec fichiers
        // (ajouter selon votre structure)

    } catch (error) {
        console.error('   ✗ Erreur récupération fichiers référencés:', error.message);
    }

    return referencedFiles;
}

// Nettoyer fichiers d'un cours
async function cleanCourseFiles(courseId) {
    try {
        const courseDir = path.join(CONFIG.UPLOADS_DIR, 'courses', courseId.toString());

        try {
            await fs.access(courseDir);
            await fs.rm(courseDir, { recursive: true, force: true });

            if (options.verbose) {
                console.log(`   ✓ Dossier cours ${courseId} supprimé`);
            }
        } catch (error) {
            // Dossier n'existe pas, c'est normal
        }
    } catch (error) {
        console.error(`   ✗ Erreur nettoyage fichiers cours ${courseId}:`, error.message);
    }
}

// Générer rapport
async function generateReport() {
    stats.endTime = new Date();
    const duration = (stats.endTime - stats.startTime) / 1000;

    console.log('\n' + '='.repeat(50));
    console.log('📊 RAPPORT DE NETTOYAGE');
    console.log('='.repeat(50));

    console.log(`⏱️  Durée: ${duration.toFixed(2)} secondes`);
    console.log(`🔍 Éléments scannés: ${stats.scanned}`);
    console.log(`❌ Erreurs: ${stats.errors}`);
    console.log('');

    console.log('🗑️  Éléments supprimés:');
    console.log(`   👥 Utilisateurs: ${stats.deleted.users}`);
    console.log(`   📚 Cours: ${stats.deleted.courses}`);
    console.log(`   💳 Paiements: ${stats.deleted.payments}`);
    console.log(`   🔒 Sessions: ${stats.deleted.sessions}`);
    console.log(`   📁 Fichiers: ${stats.deleted.files}`);
    console.log('');

    console.log('📈 Espace libéré: (estimation)');

    if (stats.deleted.files > 0) {
        console.log('   💾 Considérable pour les fichiers');
    }

    if (stats.deleted.users + stats.deleted.courses + stats.deleted.payments > 0) {
        console.log('   🗄️  Amélioration performances base de données');
    }

    console.log('');
    console.log('💡 Recommandations:');

    if (stats.deleted.users > 50) {
        console.log('   ⚠️  Beaucoup d\'utilisateurs inactifs - vérifiez votre rétention');
    }

    if (stats.deleted.courses > 10) {
        console.log('   ⚠️  Plusieurs cours non publiés - revoir le processus de création');
    }

    if (stats.errors > 0) {
        console.log('   ⚠️  Des erreurs sont survenues - vérifiez les logs');
    }

    console.log('='.repeat(50));
}

// Afficher aide
function showHelp() {
    console.log(`
Usage: node cleanup_old_data.js [options]

Options:
  --dry-run     Simuler le nettoyage sans supprimer
  --execute     Exécuter réellement le nettoyage (DANGEREUX)
  --verbose     Afficher plus de détails
  --help        Afficher cette aide

Exemples:
  node cleanup_old_data.js --dry-run --verbose
  node cleanup_old_data.js --execute

⚠️  ATTENTION: --execute supprime définitivement des données!
    Toujours tester avec --dry-run d'abord.
    `);
}

// Point d'entrée principal
async function main() {
    // Parser les arguments
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        showHelp();
        process.exit(0);
    }

    options.dryRun = args.includes('--dry-run');
    options.execute = args.includes('--execute');
    options.verbose = args.includes('--verbose');

    if (!options.dryRun && !options.execute) {
        console.log('❌ Spécifiez --dry-run ou --execute');
        console.log('   Usage: node cleanup_old_data.js --dry-run');
        process.exit(1);
    }

    if (options.dryRun) {
        console.log('🔍 MODE SIMULATION (DRY RUN) - Aucune donnée ne sera supprimée\n');
    } else if (options.execute) {
        console.log('⚠️  MODE EXÉCUTION - Les données seront SUPPRIMÉES définitivement!\n');

        // Demander confirmation
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        await new Promise((resolve) => {
            readline.question('Êtes-vous sûr? (tapez "OUI" pour continuer): ', (answer) => {
                readline.close();
                if (answer !== 'OUI') {
                    console.log('❌ Annulé');
                    process.exit(0);
                }
                resolve();
            });
        });
    }

    await init();

    // Exécuter les nettoyages
    await cleanInactiveUsers();
    await cleanUnpublishedCourses();
    await cleanFailedPayments();
    await cleanExpiredSessions();
    await cleanOrphanedFiles();

    // Générer rapport
    await generateReport();

    // Fermer connexion
    await mongoose.disconnect();
    console.log('\n✅ Nettoyage terminé');

    if (options.execute) {
        console.log('🔄 Redémarrez votre application pour voir les effets');
    }
}

// Gestion des erreurs non catchées
process.on('unhandledRejection', (error) => {
    console.error('❌ Erreur non gérée:', error);
    process.exit(1);
});

// Exécuter
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    cleanInactiveUsers,
    cleanUnpublishedCourses,
    cleanFailedPayments,
    cleanExpiredSessions,
    cleanOrphanedFiles,
};