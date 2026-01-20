console.log("==== Debut du server ===");
console.log(" verifie les import .....");

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const teacherRoutes = require('./routes/teacher.routes');
const studentRoutes = require('./routes/student.routes');
//const courseRoutes = require('./routes/course.routes');
//const paymentRoutes = require('./routes/payment.routes');
const videoRoutes = require('./routes/video.routes');
//const liveClassRoutes = require('./routes/liveClass.routes');
//const assignmentRoutes = require('./routes/assignment.routes');
//const materialRoutes = require('./routes/material.routes');
//const notificationRoutes = require('./routes/notification.routes');
//const quizRoutes = require('./routes/quiz.routes');
console.log("The server is running at .....");

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');
const logger = require('./utils/logger');

// ================ 1. CONFIGURATION INITIALE SÉCURISÉE ================
const app = express();
const server = http.createServer(app);


// ================ 2. GESTION DES ERREURS NON ATTRAPÉES (CRITIQUE) ================
process.on('unhandledRejection', (reason, promise) => {
  logger.error('UNHANDLED REJECTION - Potentiel crash évité:', {
    reason: reason.message,
    stack: reason.stack,
    promise: promise
  });
});

process.on('uncaughtException', (error) => {
  logger.error('UNCAUGHT EXCEPTION - Crash imminent, sauvegarde:', {
    error: error.message,
    stack: error.stack
  });
  // Ne pas quitter en production, laisser le cluster gérer
  if (process.env.NODE_ENV === 'development') process.exit(1);
});

// ================ 3. MIDDLEWARE DE SÉCURITÉ RENFORCÉ ================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000']
    }
  },
  crossOriginEmbedderPolicy: false
}));

// ================ 4. RATE LIMITING INTELLIGENT ================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Limites par type de route
    if (req.path.includes('/auth/login')) return 10; // Login strict
    if (req.path.includes('/upload')) return 20; // Uploads
    return 100; // Général
  },
  message: {
    success: false,
    error: 'Trop de requêtes. Réessayez dans 15 minutes.'
  },
  standardHeaders: true,
  skip: (req) => {
    // Les webhooks externes ne sont pas limités
    return req.path.includes('/webhook');
  }
});

// ================ 5. CONFIGURATION DES BODY PARSERS ================
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Protection contre les attaques de parsing malveillant
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      throw new Error('Invalid JSON payload');
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 100 // Limite le nombre de paramètres
}));

// ================ 6. PROTECTION CONTRE LES INJECTIONS ================
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn('Tentative d\'injection MongoDB bloquée:', {
      path: req.path,
      key: key
    });
  }
}));

app.use(xss());

// ================ 7. FILE UPLOAD SÉCURISÉ ================
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, 'temp'),
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB max
    files: 5 // Max 5 fichiers simultanés
  },
  abortOnLimit: true,
  safeFileNames: true,
  preserveExtension: 4,
  createParentPath: true,
  parseNested: false, // IMPORTANT: Désactive le parsing profond
  uploadTimeout: 30000 // 30 secondes timeout
}));

// Middleware pour nettoyer les fichiers temporaires en cas d'erreur
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    // Nettoyer les fichiers temporaires après l'envoi
    if (req.files) {
      Object.values(req.files).forEach(file => {
        if (file.tempFilePath && require('fs').existsSync(file.tempFilePath)) {
          require('fs').unlink(file.tempFilePath, (err) => {
            if (err) logger.error('Erreur nettoyage fichier:', err);
          });
        }
      });
    }
    originalSend.call(this, data);
  };
  next();
});

// ================ 8. CORS SÉCURISÉ ================
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.FRONTEND_URL 
      ? process.env.FRONTEND_URL.split(',')
      : ['http://localhost:3000'];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn('Tentative CORS bloquée:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 heures
};
app.use(cors(corsOptions));

// ================ 9. COMPRESSION ================
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// ================ 10. STATIC FILES AVEC CACHE ================
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1y',
  setHeaders: (res, filePath) => {
    // Cache agressif pour les assets
    if (filePath.match(/\.(jpg|jpeg|png|gif|ico|css|js)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
    // Pas de cache pour les PDF sensibles
    if (filePath.match(/\.(pdf)$/)) {
      res.setHeader('Cache-Control', 'no-store');
    }
  }
}));

// ================ 11. CONNEXION MONGODB ROBUSTE ================
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
  retryWrites: true,
  w: 'majority'
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/educours', mongooseOptions)
.then(() => {
  logger.info('✅ MongoDB connecté avec succès');
  
  // Événements de connexion
  mongoose.connection.on('error', (err) => {
    logger.error('❌ Erreur MongoDB:', err.message);
  });
  
  mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️ MongoDB déconnecté - Tentative de reconnexion...');
  });
  
  mongoose.connection.on('reconnected', () => {
    logger.info('✅ MongoDB reconnecté');
  });
})
.catch((err) => {
  logger.error('❌ ÉCHEC connexion MongoDB:', err.message);
  // En production, on ne quitte pas, on retry
  if (process.env.NODE_ENV === 'development') {
    logger.warn('Mode développement: Continuer sans DB');
  }
});

// ================ 12. SOCKET.IO AVEC GESTION D'ERREURS ================
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6 // 1MB max
});

// Global socket.io instance
app.set('io', io);

// Socket.IO avec try-catch partout
io.on('connection', (socket) => {
  logger.info('Nouvelle connexion socket:', socket.id);
  
  // Join room pour course spécifique
  socket.on('join-course', (courseId) => {
    try {
      if (!courseId || typeof courseId !== 'string') {
        return socket.emit('error', { message: 'ID cours invalide' });
      }
      socket.join(`course-${courseId}`);
      logger.info(`Socket ${socket.id} a rejoint course-${courseId}`);
    } catch (error) {
      logger.error('Erreur join-course:', error);
      socket.emit('error', { message: 'Erreur interne' });
    }
  });
  
  // Live class events
  socket.on('join-live-class', (classId) => {
    try {
      if (!classId) throw new Error('ID classe requis');
      socket.join(`live-class-${classId}`);
      socket.to(`live-class-${classId}`).emit('user-joined', {
        socketId: socket.id,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Erreur join-live-class:', error);
      socket.emit('error', { message: 'Impossible de rejoindre la classe' });
    }
  });
  
  // Chat messages
  socket.on('send-message', (data) => {
    try {
      if (!data || !data.classId || !data.message) {
        throw new Error('Données message invalides');
      }
      
      // Limite la taille du message
      if (data.message.length > 1000) {
        throw new Error('Message trop long');
      }
      
      socket.to(`live-class-${data.classId}`).emit('receive-message', {
        ...data,
        senderId: socket.id,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Erreur send-message:', error);
      socket.emit('error', { message: error.message });
    }
  });
  
  socket.on('disconnect', (reason) => {
    logger.info('Déconnexion socket:', { socketId: socket.id, reason });
  });
  
  // Heartbeat pour détecter les connexions mortes
  socket.on('heartbeat', () => {
    socket.emit('heartbeat-ack');
  });
});

// ================ 13. ROUTES API AVEC RATE LIMITING ================
// Routes publiques
app.use('/api/auth', authRoutes);
app.use('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    memory: process.memoryUsage()
  });
});

// Routes protégées avec rate limiting
app.use('/api/', apiLimiter);

// Routes avec authentification
app.use('/api/users', authMiddleware.verifyToken, userRoutes);
app.use('/api/admin', authMiddleware.verifyToken, authMiddleware.isAdmin, adminRoutes);
app.use('/api/teachers', authMiddleware.verifyToken, authMiddleware.isTeacher, teacherRoutes);
app.use('/api/students', authMiddleware.verifyToken, authMiddleware.isStudent, studentRoutes);
//app.use('/api/courses', authMiddleware.verifyToken, courseRoutes);
//app.use('/api/payments', authMiddleware.verifyToken, paymentRoutes);
app.use('/api/videos', authMiddleware.verifyToken, videoRoutes);
//app.use('/api/live-classes', authMiddleware.verifyToken, liveClassRoutes);
//app.use('/api/assignments', authMiddleware.verifyToken, assignmentRoutes);
//app.use('/api/materials', authMiddleware.verifyToken, materialRoutes);
//app.use('/api/quiz', authMiddleware.verifyToken, quizRoutes);
//app.use('/api/notification', authMiddleware.verifyToken, notificationRoutes);

console.log("the server is running good......");
// ================ 14. MIDDLEWARE DE TIMEOUT ================
app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    logger.warn('Timeout requête:', { path: req.path, method: req.method });
    res.status(503).json({ error: 'Request timeout' });
  });
  res.setTimeout(30000);
  next();
});

// ================ 15. ERROR HANDLER ================
app.use(errorHandler);

// ================ 16. 404 HANDLER ================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} non trouvée`
  });
});


// ================ 17. DÉMARRAGE SÉCURISÉ ================
const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
  🚀 SERVEUR EDUCOURS DÉMARRÉ
  ============================
  📍 Port: ${PORT}
  🌍 Env: ${process.env.NODE_ENV || 'development'}
  🔗 URL: http://localhost:${PORT}
  ⏰ ${new Date().toISOString()}
  `);
  
  logger.info(`Serveur démarré sur le port ${PORT}`);
});

// ================ 18. ARRÊT PROPRE ================
const gracefulShutdown = () => {
  logger.info('🛑 Arrêt propre du serveur...');
  
  // Fermer le serveur HTTP
  server.close(() => {
    logger.info('✅ Serveur HTTP fermé');
    
    // Fermer MongoDB
    mongoose.connection.close(false, () => {
      logger.info('✅ MongoDB fermé');
      process.exit(0);
    });
    
    // Timeout de sécurité
    setTimeout(() => {
      logger.error('❌ Timeout lors de l\'arrêt - Forcé');
      process.exit(1);
    }, 10000);
  });
};

// Capturer les signaux d'arrêt
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = { app, server, io };

