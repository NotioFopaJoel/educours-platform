// backend/fix-all.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function fixAllIssues() {
    try {
        console.log('🔧 Début de la réparation...\n');

        // 1. Connecter à MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/educours');
        console.log('✅ Connecté à MongoDB');

        // 2. Créer/modifier le modèle User
        const userSchema = new mongoose.Schema({
            email: String,
            passwordHash: String,
            firstName: String,
            lastName: String,
            role: String,
            isVerified: Boolean,
            isActive: Boolean,
            avatar: Object
        }, { timestamps: true });

        const User = mongoose.model('User', userSchema);

        // 3. Vérifier et corriger votre compte
        const yourEmail = 'joel@educour.com';
        let user = await User.findOne({ email: yourEmail });

        if (!user) {
            console.log('❌ Compte non trouvé, création...');
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash('joel@1234', salt);

            user = new User({
                email: yourEmail,
                password: passwordHash,
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                isVerified: true,
                isActive: true
            });

            await user.save();
            console.log('✅ Compte créé');
        } else {
            console.log('✅ Compte existant trouvé');

            // Corriger les champs manquants
            const updates = {};

            if (!user.isVerified) {
                updates.isVerified = true;
                console.log('🔧 Correction: isVerified = true');
            }

            if (!user.isActive) {
                updates.isActive = true;
                console.log('🔧 Correction: isActive = true');
            }

            if (!user.role) {
                updates.role = 'admin';
                console.log('🔧 Correction: role = admin');
            }

            if (Object.keys(updates).length > 0) {
                await User.updateOne({ _id: user._id }, { $set: updates });
                console.log('✅ Compte corrigé');
            }

            // Réinitialiser le mot de passe si nécessaire
            const testPassword = await bcrypt.compare('Admin@1234', user.passwordHash);
            if (!testPassword) {
                const salt = await bcrypt.genSalt(10);
                user.passwordHash = await bcrypt.hash('Admin@1234', salt);
                await user.save();
                console.log('🔑 Mot de passe réinitialisé: Admin@1234');
            }
        }

        // 4. Tester la génération de token
        console.log('\n🔐 Test génération token...');
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'fallback-secret-123',
            { expiresIn: '7d' }
        );

        console.log('✅ Token généré avec succès');
        console.log('📝 Longueur token:', token.length);

        // 5. Tester la vérification
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-123');
            console.log('✅ Token vérifié avec succès');
            console.log('👤 Données décodées:', {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            });
        } catch (error) {
            console.log('❌ Erreur vérification token:', error.message);
        }

        // 6. Vérifier tous les utilisateurs
        console.log('\n👥 Liste des utilisateurs:');
        const allUsers = await User.find({}, 'email role isVerified isActive');
        allUsers.forEach(u => {
            console.log(`- ${u.email} (${u.role}) - Vérifié: ${u.isVerified} - Actif: ${u.isActive}`);
        });

        // 7. Instructions finales
        console.log('\n🎉 RÉPARATION TERMINÉE !');
        console.log('\n📋 INFORMATIONS DE CONNEXION:');
        console.log('📧 Email:', yourEmail);
        console.log('🔑 Mot de passe: Admin@1234');
        console.log('👑 Rôle: admin');
        console.log('✅ isVerified: true');
        console.log('\n🚀 Étapes suivantes:');
        console.log('1. Vérifiez que JWT_SECRET est défini dans .env');
        console.log('2. Redémarrez le backend: npm run dev');
        console.log('3. Connectez-vous avec les identifiants ci-dessus');

        await mongoose.disconnect();

    } catch (error) {
        console.error('❌ Erreur lors de la réparation:', error);
        console.error('Stack:', error.stack);
    }
}

fixAllIssues();