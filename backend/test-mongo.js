const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('URL utilisée:', MONGODB_URI.replace(/:[^:]*@/, ':****@')); // Cache le mot de passe

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB ATLAS connecté avec succès !');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ ERREUR DE CONNEXION:', err.message);
    console.error('Code erreur:', err.name);
    process.exit(1);
  });