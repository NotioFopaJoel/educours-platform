// createRealAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/educours');

        // Définir le schéma
        const userSchema = new mongoose.Schema({
            email: String,
            passwordHash: String,
            firstName: String,
            lastName: String,
            role: String,
            isVerified: Boolean,
            isActive: Boolean
        }, { timestamps: true });

        const User = mongoose.models.User || mongoose.model('User', userSchema);

        // Hash du mot de passe
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('AdminSecure@2024', salt);

        // Créer l'admin
        const admin = await User.findOneAndUpdate(
            { email: 'admin@educours.com' },
            {
                email: 'admin@educours.com',
                passwordHash: passwordHash,
                firstName: 'Super',
                lastName: 'Admin',
                role: admin,
                isVerified: true,
                isActive: true
            },
            { upsert: true, new: true }
        );

        console.log('✅ Admin créé/modifié avec succès !');
        console.log('📧 Email: admin@educours.com');
        console.log('🔑 Mot de passe: AdminSecure@2024');
        console.log('👤 Role: admin');
        console.log('✅ isVerified: true');

        // Vérifier aussi votre compte existant
        const yourAccount = await User.findOne({ email: 'admi123n@educour.com' });
        if (yourAccount) {
            console.log('\n=== VOTRE COMPTE EXISTANT ===');
            console.log('Email:', yourAccount.email);
            console.log('isVerified:', yourAccount.isVerified);

            // Si non vérifié, le vérifier
            if (!yourAccount.isVerified) {
                yourAccount.isVerified = true;
                await yourAccount.save();
                console.log('✅ Votre compte a été marqué comme vérifié !');
            }
        }

        mongoose.disconnect();

    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

createAdmin();