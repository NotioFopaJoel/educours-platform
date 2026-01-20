// backend/fix403.js
require('dotenv').config();
const mongoose = require('mongoose');

async function fix403() {
    try {
        console.log('🔧 Fix erreur 403...\n');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/educours');

        const userSchema = new mongoose.Schema({
            email: String,
            role: String,
            isVerified: Boolean,
            isActive: Boolean
        });

        const User = mongoose.model('User', userSchema);

        const email = 'admi123n@educour.com';

        // FORCER la correction du compte
        await User.findOneAndUpdate(
            { email: email },
            {
                $set: {
                    isVerified: true,
                    isActive: true,
                    role: 'admin'
                }
            },
            { upsert: true, new: true }
        );

        console.log('✅ COMPTE CORRIGÉ:');
        console.log(`   📧 ${email}`);
        console.log('   ✅ isVerified: true');
        console.log('   ✅ isActive: true');
        console.log('   👑 role: admin');

        // Vérifier
        const user = await User.findOne({ email });
        console.log('\n🔍 Vérification:');
        console.log(JSON.stringify(user, null, 2));

        console.log('\n🔄 Redémarrez le backend et réessayez!');

        await mongoose.disconnect();

    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

fix403();