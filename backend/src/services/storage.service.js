// backend/src/services/storage.service.js
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const logger = require('../utils/logger');
const { ALLOWED_FILE_TYPES, MAX_FILE_SIZES } = require('../utils/constants');

const unlinkAsync = promisify(fs.unlink);

class StorageService {
    constructor() {
        this.cloudinaryEnabled = process.env.CLOUDINARY_ENABLED === 'true';
        this.localUploadDir = process.env.UPLOAD_DIR || 'uploads';
        
        // Créer les dossiers locaux s'ils n'existent pas
        this.createUploadDirectories();
    }

    /**
     * Crée les dossiers d'upload locaux
     */
    createUploadDirectories() {
        const directories = [
            'profiles',
            'courses',
            'assignments',
            'materials',
            'videos',
            'thumbnails'
        ];

        directories.forEach(dir => {
            const dirPath = path.join(this.localUploadDir, dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        });
    }

    /**
     * Valide un fichier avant upload
     * @param {Object} file - Fichier à valider
     * @param {string} type - Type de fichier (image, video, document)
     * @returns {Object} - Résultat de validation
     */
    validateFile(file, type) {
        const allowedTypes = ALLOWED_FILE_TYPES[type.toUpperCase()];
        const maxSize = MAX_FILE_SIZES[type.toUpperCase()];

        if (!allowedTypes) {
            return { valid: false, error: 'Type de fichier non supporté' };
        }

        if (!allowedTypes.includes(file.mimetype)) {
            return { valid: false, error: 'Type MIME non autorisé' };
        }

        if (file.size > maxSize) {
            const maxSizeMB = maxSize / (1024 * 1024);
            return { valid: false, error: `Taille maximale dépassée (${maxSizeMB}MB)` };
        }

        return { valid: true };
    }

    /**
     * Upload vers Cloudinary
     * @param {string} filePath - Chemin du fichier
     * @param {string} folder - Dossier de destination
     * @param {Object} options - Options Cloudinary
     * @returns {Promise<Object>} - Résultat de l'upload
     */
    async uploadToCloudinary(filePath, folder, options = {}) {
        try {
            const result = await cloudinary.uploader.upload(filePath, {
                folder: `educours/${folder}`,
                resource_type: 'auto',
                use_filename: true,
                unique_filename: false,
                ...options
            });

            logger.info('File uploaded to Cloudinary', {
                folder,
                publicId: result.public_id,
                url: result.secure_url
            });

            return {
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                bytes: result.bytes,
                provider: 'cloudinary'
            };
        } catch (error) {
            logger.error('Cloudinary upload failed:', error);
            throw error;
        }
    }

    /**
     * Upload local
     * @param {Object} file - Fichier Multer
     * @param {string} folder - Dossier de destination
     * @returns {Promise<Object>} - Résultat de l'upload
     */
    async uploadLocal(file, folder) {
        try {
            // Générer un nom de fichier unique
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const extension = path.extname(file.originalname);
            const filename = `${timestamp}-${randomString}${extension}`;
            
            // Chemin de destination
            const destinationPath = path.join(this.localUploadDir, folder, filename);
            
            // Déplacer le fichier
            await fs.promises.rename(file.path, destinationPath);
            
            // URL accessible
            const fileUrl = `/uploads/${folder}/${filename}`;

            logger.info('File uploaded locally', {
                folder,
                filename,
                path: destinationPath
            });

            return {
                url: fileUrl,
                path: destinationPath,
                filename,
                mimetype: file.mimetype,
                size: file.size,
                provider: 'local'
            };
        } catch (error) {
            logger.error('Local upload failed:', error);
            throw error;
        }
    }

    /**
     * Upload un fichier
     * @param {Object} file - Fichier Multer
     * @param {string} type - Type de fichier
     * @param {string} folder - Dossier de destination
     * @param {Object} options - Options supplémentaires
     * @returns {Promise<Object>} - Métadonnées du fichier
     */
    async uploadFile(file, type, folder, options = {}) {
        try {
            // Valider le fichier
            const validation = this.validateFile(file, type);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            let uploadResult;

            if (this.cloudinaryEnabled && type !== 'document') {
                // Upload vers Cloudinary pour images et vidéos
                uploadResult = await this.uploadToCloudinary(
                    file.path,
                    folder,
                    options
                );
                
                // Supprimer le fichier temporaire
                await unlinkAsync(file.path);
            } else {
                // Upload local
                uploadResult = await this.uploadLocal(file, folder);
            }

            return {
                ...uploadResult,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                uploadedAt: new Date()
            };
        } catch (error) {
            logger.error('File upload failed:', {
                error: error.message,
                type,
                folder,
                filename: file.originalname
            });
            throw error;
        }
    }

    /**
     * Upload une image
     * @param {Object} file - Fichier image
     * @param {string} folder - Dossier de destination
     * @returns {Promise<Object>} - Métadonnées de l'image
     */
    async uploadImage(file, folder = 'images') {
        return this.uploadFile(file, 'image', folder, {
            transformation: [
                { width: 800, height: 600, crop: 'limit' },
                { quality: 'auto:good' }
            ]
        });
    }

    /**
     * Upload une vidéo
     * @param {Object} file - Fichier vidéo
     * @param {string} folder - Dossier de destination
     * @returns {Promise<Object>} - Métadonnées de la vidéo
     */
    async uploadVideo(file, folder = 'videos') {
        return this.uploadFile(file, 'video', folder, {
            resource_type: 'video',
            chunk_size: 6000000 // 6MB chunks
        });
    }

    /**
     * Upload un document
     * @param {Object} file - Fichier document
     * @param {string} folder - Dossier de destination
     * @returns {Promise<Object>} - Métadonnées du document
     */
    async uploadDocument(file, folder = 'documents') {
        return this.uploadFile(file, 'document', folder);
    }

    /**
     * Supprime un fichier
     * @param {string} url - URL du fichier
     * @param {string} provider - Fournisseur de stockage
     * @returns {Promise<boolean>} - Succès de la suppression
     */
    async deleteFile(url, provider) {
        try {
            if (provider === 'cloudinary') {
                // Extraire le public_id de l'URL Cloudinary
                const publicId = this.extractCloudinaryPublicId(url);
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                    logger.info('Cloudinary file deleted', { publicId });
                }
            } else if (provider === 'local') {
                // Supprimer le fichier local
                const filePath = path.join(__dirname, '..', '..', url);
                if (fs.existsSync(filePath)) {
                    await unlinkAsync(filePath);
                    logger.info('Local file deleted', { path: filePath });
                }
            }

            return true;
        } catch (error) {
            logger.error('File deletion failed:', {
                error: error.message,
                url,
                provider
            });
            throw error;
        }
    }

    /**
     * Extrait le public_id d'une URL Cloudinary
     * @param {string} url - URL Cloudinary
     * @returns {string} - public_id
     */
    extractCloudinaryPublicId(url) {
        const regex = /\/upload\/(?:v\d+\/)?(.+?)\.(?:jpg|png|gif|webp|mp4|webm|ogg|pdf)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    /**
     * Génère une URL signée pour un fichier privé
     * @param {string} publicId - ID public Cloudinary
     * @param {number} expiresIn - Expiration en secondes
     * @returns {string} - URL signée
     */
    generateSignedUrl(publicId, expiresIn = 3600) {
        if (!this.cloudinaryEnabled) {
            throw new Error('Cloudinary not enabled');
        }

        return cloudinary.url(publicId, {
            secure: true,
            sign_url: true,
            expires_at: Math.floor(Date.now() / 1000) + expiresIn
        });
    }

    /**
     * Optimise une image pour le web
     * @param {string} url - URL de l'image
     * @param {Object} options - Options d'optimisation
     * @returns {string} - URL optimisée
     */
    optimizeImage(url, options = {}) {
        if (!this.cloudinaryEnabled) {
            return url; // Retourner l'URL originale si Cloudinary n'est pas activé
        }

        const defaultOptions = {
            width: 800,
            height: 600,
            crop: 'fill',
            quality: 'auto:good',
            format: 'webp'
        };

        const publicId = this.extractCloudinaryPublicId(url);
        if (!publicId) return url;

        return cloudinary.url(publicId, {
            ...defaultOptions,
            ...options,
            secure: true
        });
    }
}

module.exports = new StorageService();