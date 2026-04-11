// debug500.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

console.log('🔍 Début du diagnostic 500...\n');

// 1. Vérifier les variables d'environnement
console.log('1. Variables d\'environnement:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'non défini');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? 'défini' : 'NON DÉFINI !');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'défini' : 'NON DÉFINI !');
console.log('   PORT:', process.env.PORT || 5000);

// 2. Tester la connexion MongoDB
console.log('\n2. Test connexion MongoDB...');
async function testMongoDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/educours', {
            serverSelectionTimeoutMS: 5000
        });
        console.log('   ✅ MongoDB connecté');

        // Vérifier si la collection users existe
        const collections = await mongoose.connection.db.listCollections().toArray();
        const hasUsers = collections.some(c => c.name === 'users');
        console.log('   ✅ Collection "users":', hasUsers ? 'EXISTE' : 'NON TROUVÉE');

        if (hasUsers) {
            const User = mongoose.model('User', new mongoose.Schema({ email: String }));
            const userCount = await User.countDocuments();
            console.log('   👥 Nombre d\'utilisateurs:', userCount);

            // Chercher votre compte
            const yourAccount = await User.findOne({ email: 'admi123n@educour.com' });
            console.log('   📧 Votre compte trouvé:', yourAccount ? 'OUI' : 'NON');
        }

        await mongoose.disconnect();

    } catch (error) {
        console.log('   ❌ Erreur MongoDB:', error.message);
    }
}

// 3. Tester bcrypt (cause fréquente de 500)
console.log('\n3. Test bcrypt...');
try {
    const hash = bcrypt.hashSync('test', 10);
    console.log('   ✅ Bcrypt fonctionne');
} catch (error) {
    console.log('   ❌ Erreur bcrypt:', error.message);
}

// 4. Simuler une requête login
console.log('\n4. Simulation requête login...');
async function simulateLogin() {
    try {
        // Créer un schéma minimal
        const userSchema = new mongoose.Schema({
            email: String,
            passwordHash: String,
            isVerified: Boolean
        });

        const User = mongoose.model('UserTemp', userSchema);

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/educours');

        // Chercher l'utilisateur
        const user = await User.findOne({ email: 'admi123n@educour.com' });

        if (user && user.passwordHash) {
            console.log('   ✅ Utilisateur trouvé');
            console.log('   isVerified:', user.isVerified);

            // Tester avec un mot de passe commun
            const commonPasswords = ['admin123', 'Admin@123', 'password', '123456'];
            for (const pwd of commonPasswords) {
                try {
                    const match = await bcrypt.compare(pwd, user.passwordHash);
                    if (match) {
                        console.log(`   🔑 Mot de passe probable: "${pwd}"`);
                        break;
                    }
                } catch (e) {
                    console.log(`   ❌ Erreur bcrypt.compare pour "${pwd}":`, e.message);
                }
            }
        } else {
            console.log('   ❌ Utilisateur non trouvé ou pas de passwordHash');
        }

        await mongoose.disconnect();

    } catch (error) {
        console.log('   ❌ Erreur simulation:', error.message);
        console.log('   Stack:', error.stack);
    }
}

// Exécuter les tests
(async () => {
    await testMongoDB();
    await simulateLogin();

    console.log('\n🔧 Solutions possibles:');
    console.log('1. Vérifiez les logs du backend (npm run dev)');
    console.log('2. Vérifiez que MONGODB_URI est défini dans .env');
    console.log('3. Vérifiez que JWT_SECRET est défini');
    console.log('4. Redémarrez le backend après corrections');
})();