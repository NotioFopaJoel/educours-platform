
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const courseController = require('../controllers/course.controller');
const { routeValidations } = require('../middleware/validation');

// Routes publiques
router.get('/', courseController.getAllCourses);
router.get('/search', courseController.searchCourses);
router.get('/:id', courseController.getCourseById);

// Routes protégées
router.post('/:id/enroll', auth, courseController.enrollInCourse);
router.delete('/:id/unenroll', auth, courseController.unenrollCourse);
router.get('/recommended/for-me', auth, courseController.getRecommendedCourses);
router.get('/:id/stats', auth, courseController.getCourseStats);

// Routes enseignant/admin
router.post('/', 
  auth, 
  authorize('teacher', 'admin'), 
  routeValidations.createCourse,
  courseController.createCourse
);

router.put('/:id', 
  auth, 
  authorize('teacher', 'admin'), 
  routeValidations.updateCourse,
  courseController.updateCourse
);

router.delete('/:id', 
  auth, 
  authorize('teacher', 'admin'), 
  courseController.deleteCourse
);

// Gestion des modules
router.post('/:id/modules', 
  auth, 
  authorize('teacher', 'admin'),
  courseController.addModule
);

router.put('/:id/modules/:moduleId', 
  auth, 
  authorize('teacher', 'admin'),
  courseController.updateModule
);

module.exports = router;