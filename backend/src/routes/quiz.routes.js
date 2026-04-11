
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const quizController = require('../controllers/quiz.controller');
const { routeValidations } = require('../middleware/validation');

// Routes protégées
router.post('/', auth, authorize('teacher', 'admin'), routeValidations.createQuiz, quizController.createQuiz);
router.get('/course/:courseId', auth, quizController.getCourseQuizzes);
router.get('/:id', auth, quizController.getQuizById);
router.put('/:id', auth, authorize('teacher', 'admin'), quizController.updateQuiz);
router.delete('/:id', auth, authorize('teacher', 'admin'), quizController.deleteQuiz);
router.post('/:id/start', auth, quizController.startQuiz);
router.post('/:id/submit', auth, quizController.submitQuiz);
router.get('/:id/results', auth, quizController.getQuizResults);
router.get('/attempts/user', auth, quizController.getUserAttempts);

module.exports = router;
