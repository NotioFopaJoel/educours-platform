const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware.verifyToken, authMiddleware.isStudent);

router.get('/dashboard', studentController.getDashboard);
router.get('/enrolled-courses', studentController.getEnrolledCourses);
router.post('/enroll/:courseId', studentController.enrollInCourse);
router.get('/progress/:courseId', studentController.getCourseProgress);
router.post('/assignments/:id/submit', studentController.submitAssignment);
router.get('/grades', studentController.getGrades);

module.exports = router;