const express = require('express');
const router = express.Router();
const videoController = require('../controllers/video.controller');
const authMiddleware = require('../middleware/auth');
//const upload = require('../utils/upload');

router.use(authMiddleware.verifyToken);

router.get('/course/:courseId', videoController.getCourseVideos);
router.get('/:id', videoController.getVideo);
router.post('/', videoController.uploadVideo);
router.put('/:id', videoController.updateVideo);
router.delete('/:id', authMiddleware.isTeacher, videoController.deleteVideo);
router.post('/:id/progress', videoController.updateProgress);

module.exports = router;