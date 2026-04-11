
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const materialController = require('../controllers/material.controller');
const { fileValidations } = require('../middleware/validation');

// Routes protégées
router.post('/', 
  auth, 
  authorize('teacher', 'admin'),
  fileValidations.documentUpload('file', true),
  materialController.createMaterial
);

router.get('/course/:courseId', auth, materialController.getCourseMaterials);
router.get('/:id', auth, materialController.getMaterialById);
router.put('/:id', auth,
    authorize('teacher', 'admin'),
    materialController.updateMaterial);
router.delete('/:id', auth,
    authorize('teacher', 'admin'),
    materialController.deleteMaterial);
router.post('/:id/download', auth, materialController.recordDownload);

module.exports = router;
