// backend/src/utils/constants.js
module.exports = {
    // Rôles utilisateurs
    USER_ROLES: {
        STUDENT: 'student',
        TEACHER: 'teacher',
        ADMIN: 'admin'
    },
    
    // Statuts de paiement
    PAYMENT_STATUS: {
        PENDING: 'pending',
        COMPLETED: 'completed',
        FAILED: 'failed',
        REFUNDED: 'refunded'
    },
    
    // Types de contenu de cours
    CONTENT_TYPES: {
        VIDEO: 'video',
        PDF: 'pdf',
        QUIZ: 'quiz',
        ASSIGNMENT: 'assignment',
        LIVE_CLASS: 'live_class'
    },
    
    // Niveaux de cours
    COURSE_LEVELS: ['beginner', 'intermediate', 'advanced'],
    
    // Catégories de cours
    COURSE_CATEGORIES: [
        'mathematics', 'physics', 'computer_science',
        'chemistry', 'biology', 'english',
        'history', 'business', 'art',
        'music', 'languages', 'test_preparation'
    ],
    
    // Types de fichiers autorisés
    ALLOWED_FILE_TYPES: {
        IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        VIDEO: ['video/mp4', 'video/webm', 'video/ogg'],
        DOCUMENT: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain'
        ]
    },
    
    // Tailles max de fichiers (en bytes)
    MAX_FILE_SIZES: {
        IMAGE: 5 * 1024 * 1024, // 5MB
        VIDEO: 500 * 1024 * 1024, // 500MB
        DOCUMENT: 10 * 1024 * 1024 // 10MB
    },
    
    // Codes d'erreur HTTP personnalisés
    ERROR_CODES: {
        VALIDATION_ERROR: 1001,
        AUTHENTICATION_ERROR: 1002,
        AUTHORIZATION_ERROR: 1003,
        RESOURCE_NOT_FOUND: 1004,
        PAYMENT_ERROR: 1005,
        DATABASE_ERROR: 1006,
        EXTERNAL_SERVICE_ERROR: 1007
    },
    
    // Statuts des devoirs
    ASSIGNMENT_STATUS: {
        PENDING: 'pending',
        SUBMITTED: 'submitted',
        GRADED: 'graded',
        LATE: 'late',
        MISSING: 'missing'
    },
    
    // Statuts des quiz
    QUIZ_STATUS: {
        DRAFT: 'draft',
        PUBLISHED: 'published',
        CLOSED: 'closed'
    },
    
    // Types de notification
    NOTIFICATION_TYPES: {
        COURSE_ENROLLMENT: 'course_enrollment',
        ASSIGNMENT_DUE: 'assignment_due',
        GRADE_POSTED: 'grade_posted',
        LIVE_CLASS_STARTING: 'live_class_starting',
        PAYMENT_CONFIRMED: 'payment_confirmed',
        SYSTEM_ANNOUNCEMENT: 'system_announcement'
    }
};