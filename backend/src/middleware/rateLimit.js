// backend/src/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');
const logger = require('../utils/logger');

// Client Redis (optionnel)
let redisClient;
if (process.env.REDIS_URL) {
    redisClient = redis.createClient({
        url: process.env.REDIS_URL
    });
    redisClient.connect().catch(console.error);
}

// Limiteur général pour l'API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requêtes par IP
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisClient ? new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: 'rate-limit:'
    }) : undefined,
    handler: (req, res, next, options) => {
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            url: req.originalUrl,
            method: req.method
        });
        res.status(options.statusCode).json(options.message);
    }
});

// Limiteur strict pour l'authentification
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 5, // 5 tentatives de connexion
    message: {
        error: 'Too many login attempts, please try again after an hour.'
    },
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
        // Utiliser l'email comme clé pour limiter par compte
        return req.body.email || req.ip;
    }
});

// Limiteur pour les uploads
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 20, // 20 uploads par heure
    message: {
        error: 'Too many file uploads, please try again later.'
    }
});

// Limiteur pour les paiements
const paymentLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // 10 tentatives de paiement
    message: {
        error: 'Too many payment attempts, please try again later.'
    }
});

// Limiteur pour les requêtes coûteuses
const expensiveRequestLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50, // 50 requêtes
    message: {
        error: 'Too many requests, please slow down.'
    },
    skip: (req) => {
        // Ne pas limiter les requêtes simples
        return req.method === 'GET' && !req.path.includes('/search');
    }
});

module.exports = {
    apiLimiter,
    authLimiter,
    uploadLimiter,
    paymentLimiter,
    expensiveRequestLimiter
};