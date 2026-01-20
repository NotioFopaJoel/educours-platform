
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware.verifyToken, authMiddleware.isAdmin);

router.get('/stats', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.get('/courses', adminController.getAllCourses);
router.get('/payments', adminController.getAllPayments);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/courses/:id', adminController.deleteCourse);
router.get('/analytics/revenue', adminController.getRevenueAnalytics);

module.exports = router;
