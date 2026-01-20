// middleware/auth.js - VERSION ANTI-CRASH
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const logger = require('../utils/logger');
const crypto = require('crypto-js');

// Cache pour éviter les requêtes DB répétées
const tokenCache = new Map();
const CACHE_TTL = 60000; // 1 minute

const verifyToken = async (req, res, next) => {
  try {
    // Récupérer le token
    const token = req.headers.authorization?.split(' ')[1] || 
                  req.cookies?.token || 
                  req.query?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token manquant'
      });
    }

    // Vérifier la longueur du token
    if (token.length < 50) {
      return res.status(401).json({
        success: false,
        error: 'Token invalide'
      });
    }

    // Vérifier dans le cache
    const cacheKey = crypto.createHash('md5').update(token).digest('hex');
    const cachedUser = tokenCache.get(cacheKey);
    
    if (cachedUser && Date.now() - cachedUser.timestamp < CACHE_TTL) {
      req.userId = cachedUser.userId;
      req.userRole = cachedUser.role;
      return next();
    }

    // Vérifier le token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    
    // Vérifier l'expiration
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        success: false,
        error: 'Token expiré'
      });
    }

    // Vérifier l'utilisateur en base
    const user = await User.findById(decoded.userId)
      .select('_id email role status isActive')
      .lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Vérifier le statut
    if (user.status !== 'active' || !user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Compte désactivé'
      });
    }

    // Ajouter au cache
    tokenCache.set(cacheKey, {
      userId: user._id,
      role: user.role,
      timestamp: Date.now()
    });

    // Nettoyer le cache périodiquement
    if (tokenCache.size > 1000) {
      const now = Date.now();
      for (const [key, value] of tokenCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          tokenCache.delete(key);
        }
      }
    }

    // Ajouter aux requêtes
    req.userId = user._id;
    req.userRole = user.role;
    req.user = user;

    next();
  } catch (error) {
    logger.error('Erreur vérification token:', {
      error: error.message,
      path: req.path
    });

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token invalide'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expiré'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erreur d\'authentification'
    });
  }
};

const isAdmin = (req, res, next) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès réservé aux administrateurs'
      });
    }
    next();
  } catch (error) {
    logger.error('Erreur isAdmin middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur de permission'
    });
  }
};

const isTeacher = (req, res, next) => {
  try {
    if (req.userRole !== 'teacher' && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès réservé aux enseignants'
      });
    }
    next();
  } catch (error) {
    logger.error('Erreur isTeacher middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur de permission'
    });
  }
};

const isStudent = (req, res, next) => {
  try {
    if (req.userRole !== 'student' && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès réservé aux étudiants'
      });
    }
    next();
  } catch (error) {
    logger.error('Erreur isStudent middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur de permission'
    });
  }
};

const isTeacherOrAdmin = (req, res, next) => {
  try {
    if (req.userRole !== 'teacher' && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès réservé aux enseignants et administrateurs'
      });
    }
    next();
  } catch (error) {
    logger.error('Erreur isTeacherOrAdmin middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur de permission'
    });
  }
};

// Middleware de validation des données
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));

        return res.status(400).json({
          success: false,
          error: 'Validation échouée',
          details: errors
        });
      }

      req.body = value;
      next();
    } catch (error) {
      logger.error('Erreur validation:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur de validation'
      });
    }
  };
};

module.exports = {
  verifyToken,
  isAdmin,
  isTeacher,
  isStudent,
  isTeacherOrAdmin,
  validateRequest
};