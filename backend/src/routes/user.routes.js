const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth');

// Routes publiques
router.get('/public/profile/:id', userController.getPublicProfile);

// Routes protégées (nécessitent authentification)
router.use(authMiddleware.verifyToken);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/enrollments', userController.getEnrollments);
router.get('/progress/:courseId', userController.getCourseProgress);

module.exports = router;