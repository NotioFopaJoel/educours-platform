// utils/logger.js - LOGGING PROFESSIONNEL
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Créer le dossier logs s'il n'existe pas
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Format personnalisé
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Format pour la console
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`;
  })
);

// Créer le logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'educours-backend' },
  transports: [
    // Fichier erreurs
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      tailable: true
    }),
    
    // Fichier général
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      tailable: true
    }),
    
    // Fichier HTTP (requêtes)
    new winston.transports.File({
      filename: path.join(logDir, 'http.log'),
      level: 'http',
      maxsize: 5242880,
      maxFiles: 5,
      tailable: true
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 5242880,
      maxFiles: 5
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Ajouter la console en développement
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

// Méthodes utilitaires
logger.request = function(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.http('Requête HTTP', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.userId || 'anonymous'
    });
    
    // Log les erreurs HTTP
    if (res.statusCode >= 400) {
      logger.warn('Erreur HTTP', {
        status: res.statusCode,
        path: req.path,
        userId: req.userId,
        body: res.statusCode >= 500 ? undefined : req.body // Pas de logs sensibles en prod
      });
    }
  });
  
  if (next) next();
};

// Middleware pour Express
logger.middleware = function(req, res, next) {
  logger.request(req, res, next);
};

// Fonction pour logguer les erreurs critiques
logger.critical = function(message, meta = {}) {
  logger.error(`🔴 CRITIQUE: ${message}`, meta);
  
  // En production, envoyer une alerte (Slack, Email, etc.)
  if (process.env.NODE_ENV === 'production') {
    // Ici vous pourriez intégrer Sentry, Slack webhook, etc.
    console.error('🚨 ALERTE CRITIQUE:', message, meta);
  }
};

// Fonction pour logguer les transactions
logger.transaction = function(type, data) {
  logger.info(`💳 Transaction ${type}`, {
    ...data,
    timestamp: new Date().toISOString()
  });
};

// Fonction pour logguer les actions utilisateur
logger.userAction = function(userId, action, details = {}) {
  logger.info(`👤 Action utilisateur`, {
    userId,
    action,
    ...details,
    timestamp: new Date().toISOString()
  });
};

module.exports = logger;