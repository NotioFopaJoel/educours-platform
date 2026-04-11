const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// === CONFIGURATION DES DOSSIERS ===
const baseUploadDir = 'public/uploads';

// Créer les dossiers s'ils n'existent pas
const createDirectories = () => {
  const directories = [
    'avatars',
    'courses',
    'documents',
    'assignments',
    'temporary'
  ];

  directories.forEach(dir => {
    const fullPath = path.join(baseUploadDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Dossier créé: ${fullPath}`);
    }
  });
};

// Initialiser les dossiers
createDirectories();

// === FONCTIONS UTILITAIRES ===
const generateFilename = (originalname) => {
  const ext = path.extname(originalname).toLowerCase();
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${random}${ext}`;
};

const getMimeTypeCategory = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.includes('document') || mimetype.includes('msword') || mimetype.includes('wordprocessing')) return 'document';
  if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) return 'spreadsheet';
  if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'presentation';
  if (mimetype.includes('zip') || mimetype.includes('compressed')) return 'archive';
  return 'other';
};

// === CONFIGURATIONS DE STOCKAGE ===
const diskStorage = (subfolder = 'general') => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const category = getMimeTypeCategory(file.mimetype);
      const destPath = path.join(baseUploadDir, subfolder, category);
      
      // Créer le dossier s'il n'existe pas
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      
      cb(null, destPath);
    },
    filename: (req, file, cb) => {
      const filename = generateFilename(file.originalname);
      cb(null, filename);
    }
  });
};

const memoryStorage = multer.memoryStorage();

// === FILTRES DE FICHIERS ===
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|bmp|svg/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif, webp, bmp, svg)'), false);
  }
};

const documentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt|rtf|odt|ods|odp/;
  const mimetype = file.mimetype.includes('application') || file.mimetype.includes('text');
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seuls les documents sont autorisés (PDF, Word, Excel, PowerPoint, TXT)'), false);
  }
};

const mediaFilter = (req, file, cb) => {
  const allowedTypes = /mp4|webm|ogg|mov|avi|mkv|mp3|wav|ogg|flac|aac/;
  const mimetype = file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/');
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers audio/vidéo sont autorisés'), false);
  }
};

const allFilesFilter = (req, file, cb) => {
  // Liste noire des types dangereux
  const dangerousTypes = [
    'application/x-msdownload', // .exe
    'application/x-msdos-program',
    'application/bat',
    'application/x-bat',
    'application/x-ms-shortcut',
    'application/x-sh',
    'application/x-shellscript',
    'application/x-php',
    'application/x-httpd-php',
    'text/x-php',
    'application/x-python',
  ];

  if (dangerousTypes.includes(file.mimetype)) {
    return cb(new Error('Type de fichier dangereux non autorisé'), false);
  }

  // Taille max vérifiée par les limits de multer
  cb(null, true);
};

// === INSTANCES MULTER PRÉCONFIGURÉES ===

// 1. Pour les avatars (images uniquement, 5MB max)
const avatarUpload = multer({
  storage: diskStorage('avatars'),
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  }
});

// 2. Pour les documents de cours (documents uniquement, 20MB max)
const courseDocumentUpload = multer({
  storage: diskStorage('courses'),
  fileFilter: documentFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
    files: 5
  }
});

// 3. Pour les médias (audio/vidéo, 100MB max)
const mediaUpload = multer({
  storage: diskStorage('media'),
  fileFilter: mediaFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 1
  }
});

// 4. Upload général (tous types sécurisés, 50MB max)
const generalUpload = multer({
  storage: diskStorage('general'),
  fileFilter: allFilesFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10
  }
});

// 5. Upload en mémoire (pour traitement avant sauvegarde)
const memoryUpload = multer({
  storage: memoryStorage,
  fileFilter: allFilesFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// 6. Upload multiple avec types mixtes
const mixedUpload = multer({
  storage: diskStorage('mixed'),
  fileFilter: (req, file, cb) => {
    // Accepter images, documents et PDFs
    const isImage = imageFilter(req, file, (err, accept) => accept);
    const isDocument = documentFilter(req, file, (err, accept) => accept);
    
    if (isImage || isDocument) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images et documents sont autorisés'), false);
    }
  },
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB par fichier
    files: 10
  }
});

// === MIDDLEWARES PRATIQUES ===

// Single file uploads
const singleAvatar = avatarUpload.single('avatar');
const singleDocument = courseDocumentUpload.single('document');
const singleMedia = mediaUpload.single('media');
const singleFile = generalUpload.single('file');

// Multiple files uploads
const multipleAvatars = avatarUpload.array('avatars', 5);
const multipleDocuments = courseDocumentUpload.array('documents', 10);
const multipleFiles = generalUpload.array('files', 20);
const mixedFiles = mixedUpload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'documents', maxCount: 5 },
  { name: 'videos', maxCount: 3 }
]);

// === FONCTIONS UTILITAIRES POUR LES CONTROLLERS ===

/**
 * Supprimer un fichier
 * @param {string} filepath - Chemin du fichier à supprimer
 */
const deleteFile = (filepath) => {
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
    return true;
  }
  return false;
};

/**
 * Obtenir l'URL publique d'un fichier
 * @param {string} filepath - Chemin du fichier
 */
const getPublicUrl = (filepath) => {
  if (!filepath) return null;
  
  // Convertir le chemin en URL
  const relativePath = filepath.replace(/\\/g, '/').replace('public/', '');
  return `${process.env.APP_URL || 'http://localhost:3000'}/${relativePath}`;
};

/**
 * Vérifier si un fichier est une image
 * @param {string} mimetype - Type MIME du fichier
 */
const isImage = (mimetype) => {
  return mimetype && mimetype.startsWith('image/');
};

/**
 * Vérifier si un fichier est un document
 * @param {string} mimetype - Type MIME du fichier
 */
const isDocument = (mimetype) => {
  const docTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/rtf'
  ];
  return mimetype && docTypes.includes(mimetype);
};

// === MIDDLEWARE DE GESTION D'ERREURS ===
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Erreur Multer (limite de taille, etc.)
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Fichier trop volumineux.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Trop de fichiers envoyés.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Type de fichier non autorisé.'
      });
    }
  } else if (err) {
    // Erreur de filtre personnalisé
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

// === EXPORTS ===
module.exports = {
  // Configurations de stockage
  diskStorage,
  memoryStorage,
  
  // Filtres
  imageFilter,
  documentFilter,
  mediaFilter,
  allFilesFilter,
  
  // Middlewares préconfigurés (single)
  singleAvatar,
  singleDocument,
  singleMedia,
  singleFile,
  
  // Middlewares préconfigurés (multiple)
  multipleAvatars,
  multipleDocuments,
  multipleFiles,
  mixedFiles,
  
  // Uploaders complets
  avatarUpload,
  courseDocumentUpload,
  mediaUpload,
  generalUpload,
  memoryUpload,
  mixedUpload,
  
  // Fonctions utilitaires
  deleteFile,
  getPublicUrl,
  isImage,
  isDocument,
  
  // Middleware d'erreur
  handleUploadError,
  
  // Pour compatibilité avec votre code existant
  single: singleAvatar, // Alias pour upload.single('avatar')
  
  // Info
  baseUploadDir,
  generateFilename,
  getMimeTypeCategory
};