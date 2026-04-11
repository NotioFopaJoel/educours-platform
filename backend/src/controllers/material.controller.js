
const Material = require('../models/Material.model');
const Course = require('../models/Course.model');
const StorageService = require('../services/storage.service');
const logger = require('../utils/logger');
const { USER_ROLES } = require('../utils/constants');

class MaterialController {
    // POST /api/materials - Crée un matériel
    async createMaterial(req, res) {
        try {
            const { courseId, title, description, category } = req.body;

            const course = await Course.findById(courseId);
            if (!courseId) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            // Vérifier les permissions
            if (course.teacher.toString() !== req.user._id.toString() && 
                req.user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Non autorisé'
                });
            }

            let fileData = null;
            if (req.files && req.files.file) {
                const file = req.files.file;
                const uploadResult = await StorageService.uploadDocument(file, 'materials');
                fileData = {
                    filename: file.name,
                    originalName: file.name,
                    url: uploadResult.url,
                    size: file.size,
                    mimetype: file.mimetype,
                    provider: uploadResult.provider
                };
            }

            const material = await Material.create({
                course: courseId,
                createdBy: req.user._id,
                title,
                description: description || '',
                category: category || 'document',
                file: fileData,
                downloads: 0
            });

            // Ajouter le matériel au cours
            course.materials.push(material._id);
            await course.save();

            res.status(201).json({
                success: true,
                message: 'Matériel créé avec succès',
                data: material
            });
        } catch (error) {
            logger.error('Create material error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création'
            });
        }
    }

    // GET /api/materials/course/:courseId - Matériels d'un cours
    async getCourseMaterials(req, res) {
        try {
            const {courseId }= req.params;
            const user = req.user;

            const course = await Course.findById(courseId);
            if (!courseId) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            // Vérifier l'accès
            const isTeacher = course.teacher.toString() === user._id.toString();
            const isStudent = course.students.some(id => id.toString() === user._id.toString());

            if (!isTeacher && !isStudent && user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé'
                });
            }

            const materials = await Material.find({ course: courseId })
                .populate('createdBy', 'fullName avatar')
                .sort({ createdAt: -1 });

            // Grouper par catégorie
            const groupedMaterials = materials.reduce((acc, material) => {
                const category = material.category || 'other';
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(material);
                return acc;
            }, {});

            res.json({
                success: true,
                data: {
                    materials,
                    grouped: groupedMaterials,
                    categories: Object.keys(groupedMaterials)
                }
            });
        } catch (error) {
            logger.error('Get course materials error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    // GET /api/materials/:id - Détails d'un matériel
    async getMaterialById(req, res) {
        try {
            const material = await Material.findById(req.params.id)
                .populate('course', 'title thumbnail')
                .populate('createdBy', 'fullName avatar');

            if (!material) {
                return res.status(404).json({
                    success: false,
                    message: 'Matériel non trouvé'
                });
            }

            // Vérifier l'accès
            const course = await Course.findById(material.course);
            const isTeacher = course.teacher.toString() === req.user._id.toString();
            const isStudent = course.students.some(id => id.toString() === req.user._id.toString());

            if (!isTeacher && !isStudent && req.user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé'
                });
            }

            res.json({
                success: true,
                data: material
            });
        } catch (error) {
            logger.error('Get material by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    // PUT /api/materials/:id - Met à jour un matériel
    async updateMaterial(req, res) {
        try {
            const material = await Material.findById(req.params.id);

            if (!material) {
                return res.status(404).json({
                    success: false,
                    message: 'Matériel non trouvé'
                });
            }

            const course = await Course.findById(material.course);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            // Vérifier les permissions
            if (course.teacher.toString() !== req.user._id.toString() && 
                req.user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Non autorisé'
                });
            }

            // Mettre à jour les champs
            if (req.body.title !== undefined) material.title = req.body.title;
            if (req.body.description !== undefined) material.description = req.body.description;
            if (req.body.category !== undefined) material.category = req.body.category;

            await material.save();

            res.json({
                success: true,
                message: 'Matériel mis à jour',
                data: material
            });
        } catch (error) {
            logger.error('Update material error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour'
            });
        }
    }

    // DELETE /api/materials/:id - Supprime un matériel
    async deleteMaterial(req, res) {
        try {
            const material = await Material.findById(req.params.id);

            if (!material) {
                return res.status(404).json({
                    success: false,
                    message: 'Matériel non trouvé'
                });
            }

            const course = await Course.findById(material.course);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            // Vérifier les permissions
            if (course.teacher.toString() !== req.user._id.toString() && 
                req.user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Non autorisé'
                });
            }

            // Supprimer le fichier du stockage
            if (material.file && material.file.url) {
                await StorageService.deleteFile(material.file.url, material.file.provider);
            }

            // Retirer du cours
            course.materials = course.materials.filter(
                id => id.toString() !== material._id.toString()
            );
            await course.save();

            await material.deleteOne();

            res.json({
                success: true,
                message: 'Matériel supprimé'
            });
        } catch (error) {
            logger.error('Delete material error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression'
            });
        }
    }

    // POST /api/materials/:id/download - Enregistre un téléchargement
    async recordDownload(req, res) {
        try {
            const material = await Material.findById(req.params.id);

            if (!material) {
                return res.status(404).json({
                    success: false,
                    message: 'Matériel non trouvé'
                });
            }

            // Vérifier l'accès
            const course = await Course.findById(material.course);
            const isTeacher = course.teacher.toString() === req.user._id.toString();
            const isStudent = course.students.some(id => id.toString() === req.user._id.toString());

            if (!isTeacher && !isStudent && req.user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé'
                });
            }

            // Incrémenter le compteur de téléchargements
            material.downloads += 1;
            material.lastDownloadedAt = new Date();
            await material.save();

            res.json({
                success: true,
                data: {
                    downloadUrl: material.file.url,
                    filename: material.file.filename || material.file.originalName,
                    downloads: material.downloads
                }
            });
        } catch (error) {
            logger.error('Record download error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }
}

module.exports = new MaterialController();