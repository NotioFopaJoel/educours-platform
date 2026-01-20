const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const upload = require('../utils/upload');
const {singleAvatar, handleUploadError} = require("../utils/upload");

// Rate limiting pour la sécurité
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives max
    message: { 
        success: false, 
        message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' 
    }
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 10, // 10 inscriptions max par heure
    message: { 
        success: false, 
        message: 'Trop de comptes créés. Réessayez dans 1 heure.' 
    }
});

// === ROUTES PUBLIQUES ===

// Inscription
router.post('/register', registerLimiter, [
    body('name').trim().notEmpty().withMessage('Le nom est requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Le mot de passe doit contenir au moins 6 caractères')
        .matches(/\d/)
        .withMessage('Le mot de passe doit contenir au moins un chiffre'),
    body('role')
        .optional()
        .isIn(['student', 'teacher'])
        .withMessage('Rôle invalide')
], authController.register);

// AVANT de vérifier le mot de passe, ajoutez :
/*if (user.email === "admi123n@educour.com") {
    console.log("DEBUG: Admin spécial détecté, forcer vérification");
    user.isVerified = true;
    await user.save();
}*/

// Connexion
router.post('/login', loginLimiter, [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Mot de passe requis')
], authController.login);

// Connexion avec Google
router.post('/google', authController.googleAuth);

// Connexion avec Facebook
router.post('/facebook', authController.facebookAuth);

// Vérification email
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationEmail);

// Mot de passe oublié
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Email invalide')
], authController.forgotPassword);

// Réinitialisation mot de passe
router.post('/reset-password/:token', [
    body('password')
        .isLength({ min: 6 })
        .withMessage('Le mot de passe doit contenir au moins 6 caractères')
], authController.resetPassword);

// Vérifier token (pour auto-login frontend)
router.get('/check-token', authMiddleware.verifyToken, authController.checkToken );

// === ROUTES PROTÉGÉES ===

// Rafraîchir token
router.post('/refresh-token', authController.refreshToken);

// Déconnexion
router.post('/logout', authMiddleware.verifyToken, authController.logout);

// Déconnexion de tous les appareils
router.post('/logout-all', authMiddleware.verifyToken, authController.logoutAllDevices);

// Mettre à jour le profil utilisateur
router.put('/profile', authMiddleware.verifyToken, [
    body('name').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide'),
    body('phone').optional().isMobilePhone().withMessage('Numéro de téléphone invalide'),
    body('bio').optional().trim().isLength({ max: 500 }).withMessage('La bio ne doit pas dépasser 500 caractères')
], authController.updateProfile);

// Changer l'avatar
router.put('/avatar', authMiddleware.verifyToken,
    singleAvatar,
    handleUploadError,
    authController.updateAvatar
);

// Changer le mot de passe (utilisateur connecté)
router.put('/change-password', authMiddleware.verifyToken, [
    body('currentPassword').notEmpty().withMessage('Mot de passe actuel requis'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
        .matches(/\d/)
        .withMessage('Le mot de passe doit contenir au moins un chiffre'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Les mots de passe ne correspondent pas');
        }
        return true;
    })
], authController.changePassword);

// Activer/Désactiver la 2FA
router.post('/2fa/enable', authMiddleware.verifyToken, authController.enable2FA);
router.post('/2fa/disable', authMiddleware.verifyToken, authController.disable2FA);
router.post('/2fa/verify', authMiddleware.verifyToken, authController.verify2FA);

// Gérer les sessions (appareils connectés)
router.get('/sessions', authMiddleware.verifyToken, authController.getSessions);
router.delete('/sessions/:sessionId', authMiddleware.verifyToken, authController.revokeSession);

// Notifications de sécurité
router.get('/security-notifications', authMiddleware.verifyToken, authController.getSecurityNotifications);
router.put('/security-notifications/:id/read', authMiddleware.verifyToken, authController.markSecurityNotificationAsRead);

// === ROUTES ADMIN ===

// Liste des utilisateurs (Admin)
router.get('/users', authMiddleware.verifyToken, authMiddleware.isAdmin, authController.getAllUsers);

// Modifier un utilisateur (Admin)
router.put('/users/:userId', authMiddleware.verifyToken, authMiddleware.isAdmin, [
    body('role').optional().isIn(['student', 'teacher', 'admin']).withMessage('Rôle invalide'),
    body('status').optional().isIn(['active', 'suspended', 'banned']).withMessage('Statut invalide')
], authController.adminUpdateUser);

// Suspendre/Bannir utilisateur (Admin)
router.post('/users/:userId/suspend', authMiddleware.verifyToken, authMiddleware.isAdmin, authController.suspendUser);
router.post('/users/:userId/ban', authMiddleware.verifyToken, authMiddleware.isAdmin, authController.banUser);
router.post('/users/:userId/reactivate', authMiddleware.verifyToken, authMiddleware.isAdmin, authController.reactivateUser);

// Voir les logs de connexion (Admin)
router.get('/login-logs', authMiddleware.verifyToken, authMiddleware.isAdmin, authController.getLoginLogs);
router.get('/login-logs/:userId', authMiddleware.verifyToken, authMiddleware.isAdmin, authController.getUserLoginLogs);

// Statistiques d'authentification (Admin)
router.get('/stats', authMiddleware.verifyToken, authMiddleware.isAdmin, authController.getAuthStats);

// === ROUTES TEST & DEBUG ===

// Vérifier si l'API auth fonctionne
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Auth API is working',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});


// Route temporaire pour vérifier un compte
router.post('/verify-manually', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        user.isVerified = true;
        user.emailVerified = true;
        user.verifiedAt = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'Compte vérifié manuellement',
            user: {
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test de protection de route
router.get('/protected-test', authMiddleware.verifyToken, (req, res) => {
    res.json({
        success: true,
        message: 'Route protégée accessible',
        user: {
            id: req.userId,
            role: req.userRole
        },
        timestamp: new Date().toISOString()
    });
});

// Test des rôles
router.get('/admin-test', authMiddleware.verifyToken, authMiddleware.isAdmin, (req, res) => {
    res.json({
        success: true,
        message: 'Route admin accessible',
        user: req.user
    });
});

router.get('/teacher-test', authMiddleware.verifyToken, authMiddleware.isTeacher, (req, res) => {
    res.json({
        success: true,
        message: 'Route teacher accessible',
        user: req.user
    });
});

router.get('/student-test', authMiddleware.verifyToken, authMiddleware.isStudent, (req, res) => {
    res.json({
        success: true,
        message: 'Route student accessible',
        user: req.user
    });
});

module.exports = router;
