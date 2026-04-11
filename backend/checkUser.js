// checkUser.js
const mongoose = require('mongoose');
require('dotenv').config();

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/educours');
        console.log('✅ Connected to MongoDB');

        // Essayez différents chemins de modèle
        let User;
        try {
            User = require('./src/models/User.model');
        } catch (e1) {
            try {
                User = require('./src/models/User.model');
            } catch (e2) {
                try {
                    User = require('./src/models/User.model');
                } catch (e3) {
                    console.log('❌ Cannot find User model');
                    // Créer un schéma temporaire
                    const userSchema = new mongoose.Schema({
                        email: String,
                        passwordHash: String,
                        isVerified: Boolean,
                        role: String
                    });
                    User = mongoose.model('User', userSchema);
                }
            }
        }

        // Chercher votre compte
        const user = await User.findOne({ email: "admin@educours.com" });

        console.log('\n=== RÉSULTAT ===');
        if (!user) {
            console.log('❌ Utilisateur NON TROUVÉ dans la base de données');
        } else {
            console.log('✅ Utilisateur TROUVÉ');
            console.log('Email:', user.email);
            console.log('Role:', user.role);
            console.log('isVerified:', user.isVerified);
            console.log('isActive:', user.isActive);
            console.log('Date création:', user.createdAt);

            // Vérifier le mot de passe
            const bcrypt = require('bcryptjs');
            const testPasswords = [
                'Admin@123',
                'admin123',
                'password',
                'educours',
                '123456'
            ];

            console.log('\n🔍 Test des mots de passe communs:');
            for (const pwd of testPasswords) {
                const isMatch = user.passwordHash && await bcrypt.compare(pwd, user.passwordHash);
                if (isMatch) {
                    console.log(`✅ Mot de passe trouvé: "${pwd}"`);
                    break;
                }
            }
        }

        // Lister tous les utilisateurs
        const allUsers = await User.find({}, 'email role isVerified');
        console.log('\n=== TOUS LES UTILISATEURS ===');
        console.log(`Total: ${allUsers.length} utilisateurs`);
        allUsers.forEach(u => {
            console.log(`- ${u.email} (${u.role}) - Vérifié: ${u.isVerified}`);
        });

        mongoose.disconnect();

    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

checkUser();