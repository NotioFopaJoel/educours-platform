const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/educours');
    
    const User = require('../models/User.model');
    
    const adminExists = await User.findOne({ email: 'admin@educours.com' });
    
    if (adminExists) {
      console.log('⚠️ Admin existe déjà');
      process.exit(0);
    }
    
    const hashedPassword = await bcrypt.hash('Admin123456', 10);
    
    const admin = new User({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@educours.com',
      phone: '+237678095581',
      password: hashedPassword,
      role: 'admin',
      city: 'Buea',
      country: 'Cameroun',
      isEmailVerified: true,
      isActive: true
    });
    
    await admin.save();
    console.log('✅ Admin créé avec succès !');
    console.log('📧 Email: admin@educours.com');
    console.log('🔑 Mot de passe: Admin123456');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

createAdmin();