const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher.controller');
const authMiddleware = require('../middleware/auth');
const upload = require('../utils/upload');

router.use(authMiddleware.verifyToken, authMiddleware.isTeacher);

// Dashboard & Analytics
router.get('/dashboard', teacherController.getDashboard);
//router.get('/analytics/overview', teacherController.getOverviewAnalytics);
//router.get('/analytics/revenue', teacherController.getRevenueAnalytics);
//router.get('/analytics/students', teacherController.getStudentAnalytics);
//router.get('/analytics/courses', teacherController.getCourseAnalytics);

// Courses Management
router.get('/courses', teacherController.getMyCourses);
router.post('/courses', teacherController.createCourse);
router.get('/courses/:id', teacherController.getCourseById);
router.put('/courses/:id', teacherController.updateCourse);
//router.delete('/courses/:id', teacherController.deleteCourse);
router.put('/courses/:id/publish', teacherController.publishCourse);
//router.put('/courses/:id/unpublish', teacherController.unpublishCourse);
router.get('/courses/:id/students', teacherController.getCourseStudents);
//router.get('/courses/:id/analytics', teacherController.getCourseAnalytics);
//router.post('/courses/:id/thumbnail', upload.single('thumbnail'), teacherController.uploadThumbnail);

// Course Content
//router.post('/courses/:courseId/sections', teacherController.createSection);
/* router.put('/sections/:sectionId', teacherController.updateSection);
router.delete('/sections/:sectionId', teacherController.deleteSection);
router.post('/sections/:sectionId/lessons', teacherController.createLesson);
router.put('/lessons/:lessonId', teacherController.updateLesson);
router.delete('/lessons/:lessonId', teacherController.deleteLesson);
router.post('/lessons/:lessonId/video', upload.single('video'), teacherController.uploadLessonVideo);
router.post('/lessons/:lessonId/material', upload.array('materials'), teacherController.uploadLessonMaterials);

// Students Management
router.get('/students', teacherController.getMyStudents);
router.get('/students/:id', teacherController.getStudentDetails);
router.get('/students/:id/progress', teacherController.getStudentProgress);
router.post('/students/:id/message', teacherController.sendMessageToStudent);

// Assignments & Quizzes
router.get('/assignments', teacherController.getAssignments);
router.post('/assignments', teacherController.createAssignment);
router.get('/assignments/:id', teacherController.getAssignmentById);
router.put('/assignments/:id', teacherController.updateAssignment);
router.delete('/assignments/:id', teacherController.deleteAssignment);
router.get('/assignments/:id/submissions', teacherController.getAssignmentSubmissions);
router.post('/assignments/:id/submissions/:submissionId/grade', teacherController.gradeSubmission);

router.get('/quizzes', teacherController.getQuizzes);
router.post('/quizzes', teacherController.createQuiz);
router.get('/quizzes/:id/results', teacherController.getQuizResults);

// Live Classes
router.get('/live-classes', teacherController.getLiveClasses);
router.post('/live-classes', teacherController.scheduleLiveClass);
router.put('/live-classes/:id', teacherController.updateLiveClass);
router.delete('/live-classes/:id', teacherController.cancelLiveClass);
router.get('/live-classes/:id/attendees', teacherController.getLiveClassAttendees);
router.post('/live-classes/:id/start', teacherController.startLiveClass);
router.post('/live-classes/:id/end', teacherController.endLiveClass);

// Communications
router.get('/announcements', teacherController.getAnnouncements);
router.post('/announcements', teacherController.createAnnouncement);
router.get('/messages', teacherController.getMessages);
router.post('/messages', teacherController.sendMessage);

// Reviews & Ratings
router.get('/reviews', teacherController.getReviews);
router.get('/ratings', teacherController.getRatings);

// Earnings
router.get('/earnings', teacherController.getEarnings);
router.get('/withdrawals', teacherController.getWithdrawals);
router.post('/withdrawals', teacherController.requestWithdrawal);
router.get('/transactions', teacherController.getTransactions);*/

module.exports = router;