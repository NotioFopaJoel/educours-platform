const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../backend/src/models/User.model');
require('dotenv').config({ path: '../../backend/.env' });

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/educours');
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@educours.ma' });
        
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('Admin@123', salt);

        const adminUser = new User({
            email: 'admin@educours.ma',
            username: 'administrator',
            passwordHash: passwordHash,
            firstName: 'System',
            lastName: 'Administrator',
            role: 'admin',
            isVerified: true,
            isActive: true,
            emailVerified: true,
            phoneNumber: '+237 678095581',
            preferences: {
                notifications: {
                    email: true,
                    sms: false
                },
                language: 'fr',
                theme: 'light'
            }
        });

        await adminUser.save();
        console.log('✅ Admin user created successfully');
        console.log('📧 Email: admin@educours.ma');
        console.log('🔑 Password: Admin@123');
        console.log('⚠️  IMPORTANT: Change this password immediately!');

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

// Run if called directly
if (require.main === module) {
    createAdminUser();
}

module.exports = createAdminUser;