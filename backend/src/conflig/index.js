const database = require('./database');
const cloudinary = require('./cloudinary');
const agora = require('./agora');
const jwt = require('./jwt');
const mail = require('./mail');

module.exports = {
    database,
    cloudinary,
    agora,
    jwt,
    mail,
    // Variables d'environnement
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_VERSION: process.env.API_VERSION || 'v1',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
    // Sécurité
    CORS_OPTIONS: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
        optionsSuccessStatus: 200
    }
};