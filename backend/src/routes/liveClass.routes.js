
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const liveClassController = require('../controllers/liveClass.controller');

// Routes publiques (peut-être protégées selon besoin)
router.get('/upcoming', liveClassController.getUpcomingClasses);
router.get('/:id', liveClassController.getClassById);

// Routes protégées
router.post('/', auth, authorize('teacher', 'admin'), liveClassController.createLiveClass);
router.put('/:id', auth, authorize('teacher', 'admin'), liveClassController.updateLiveClass);
router.delete('/:id', auth, authorize('teacher', 'admin'), liveClassController.deleteLiveClass);
router.post('/:id/join', auth, liveClassController.joinLiveClass);
router.post('/:id/end', auth, authorize('teacher', 'admin'), liveClassController.endLiveClass);
router.get('/:id/participants', auth, liveClassController.getParticipants);
router.get('/user/upcoming', auth, liveClassController.getUserUpcomingClasses);
router.get('/user/history', auth, liveClassController.getUserClassHistory);

module.exports = router;
