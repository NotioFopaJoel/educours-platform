
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const assignmentController = require('../controllers/assignment.controller');
const { routeValidations } = require('../middleware/validation');

// Routes protégées
router.post('/', auth, authorize('teacher', 'admin'), routeValidations.createAssignment, assignmentController.createAssignment);
router.get('/course/:courseId', auth, assignmentController.getCourseAssignments);
router.get('/:id', auth, assignmentController.getAssignmentById);
router.put('/:id', auth, authorize('teacher', 'admin'), assignmentController.updateAssignment);
router.delete('/:id', auth, authorize('teacher', 'admin'), assignmentController.deleteAssignment);
router.post('/:id/submit', auth, assignmentController.submitAssignment);
router.get('/:id/submissions', auth, assignmentController.getSubmissions);
router.get('/submissions/:submissionId', auth, assignmentController.getSubmissionById);
router.post('/submissions/:submissionId/grade', auth, authorize('teacher', 'admin'), assignmentController.gradeSubmission);
router.get('/user/submissions', auth, assignmentController.getUserSubmissions);

module.exports = router;