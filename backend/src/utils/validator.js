// backend/src/utils/validator.js
const validator = require('validator');
const { COURSE_CATEGORIES, COURSE_LEVELS } = require('./constants');

class CustomValidator {
    /**
     * Valide une URL de vidéo
     * @param {string} url - URL à valider
     * @returns {boolean} - True si valide
     */
    static isValidVideoUrl(url) {
        if (!url) return false;
        
        // Support pour les URLs YouTube, Vimeo, et les fichiers vidéo directs
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+$/;
        const videoFileRegex = /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i;
        
        return youtubeRegex.test(url) || 
               vimeoRegex.test(url) || 
               videoFileRegex.test(url) ||
               validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true });
    }

    /**
     * Valide une catégorie de cours
     * @param {string} category - Catégorie à valider
     * @returns {boolean} - True si valide
     */
    static isValidCourseCategory(category) {
        return COURSE_CATEGORIES.includes(category);
    }

    /**
     * Valide un niveau de cours
     * @param {string} level - Niveau à valider
     * @returns {boolean} - True si valide
     */
    static isValidCourseLevel(level) {
        return COURSE_LEVELS.includes(level);
    }

    /**
     * Valide un prix
     * @param {number|string} price - Prix à valider
     * @param {Object} options - Options de validation
     * @returns {boolean} - True si valide
     */
    static isValidPrice(price, options = {}) {
        const { min = 0, max = 1000000, allowFree = true } = options;
        
        const num = parseFloat(price);
        if (isNaN(num)) return false;
        
        if (num < min) return false;
        if (num > max) return false;
        if (!allowFree && num === 0) return false;
        
        return true;
    }

    /**
     * Valide une durée en secondes
     * @param {number} seconds - Durée en secondes
     * @param {Object} options - Options de validation
     * @returns {boolean} - True si valide
     */
    static isValidDuration(seconds, options = {}) {
        const { min = 0, max = 10 * 3600 } = options; // Max 10 heures par défaut
        
        if (typeof seconds !== 'number' || isNaN(seconds)) return false;
        if (seconds < min) return false;
        if (seconds > max) return false;
        
        return true;
    }

    /**
     * Valide une note (score)
     * @param {number} score - Note à valider
     * @param {number} maxScore - Note maximale
     * @returns {boolean} - True si valide
     */
    static isValidScore(score, maxScore = 100) {
        if (typeof score !== 'number' || isNaN(score)) return false;
        if (score < 0 || score > maxScore) return false;
        
        return true;
    }

    /**
     * Valide un code de coupon
     * @param {string} couponCode - Code de coupon
     * @returns {boolean} - True si valide
     */
    static isValidCouponCode(couponCode) {
        if (!couponCode || typeof couponCode !== 'string') return false;
        
        // 6-20 caractères alphanumériques, tirets et underscores
        const couponRegex = /^[a-zA-Z0-9-_]{6,20}$/;
        return couponRegex.test(couponCode);
    }

    /**
     * Valide un numéro de téléphone international
     * @param {string} phone - Numéro de téléphone
     * @returns {boolean} - True si valide
     */
    static isValidInternationalPhone(phone) {
        if (!phone) return false;
        
        // Format international: +[indicatif][numéro]
        const phoneRegex = /^\+\d{1,4}\d{6,14}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    /**
     * Valide une date ISO avec des contraintes
     * @param {string} dateString - Date ISO
     * @param {Object} constraints - Contraintes de date
     * @returns {boolean} - True si valide
     */
    static isValidDateWithConstraints(dateString, constraints = {}) {
        if (!validator.isISO8601(dateString)) return false;
        
        const date = new Date(dateString);
        const now = new Date();
        
        if (constraints.minDate && date < new Date(constraints.minDate)) return false;
        if (constraints.maxDate && date > new Date(constraints.maxDate)) return false;
        if (constraints.futureOnly && date <= now) return false;
        if (constraints.pastOnly && date >= now) return false;
        
        return true;
    }

    /**
     * Valide un nom de fichier
     * @param {string} filename - Nom de fichier
     * @param {Object} options - Options de validation
     * @returns {boolean} - True si valide
     */
    static isValidFilename(filename, options = {}) {
        if (!filename || typeof filename !== 'string') return false;
        
        const { 
            maxLength = 255,
            allowedExtensions = [],
            disallowedCharacters = /[<>:"/\\|?*]/ 
        } = options;
        
        // Longueur maximale
        if (filename.length > maxLength) return false;
        
        // Caractères interdits
        if (disallowedCharacters.test(filename)) return false;
        
        // Extensions autorisées
        if (allowedExtensions.length > 0) {
            const extension = filename.split('.').pop().toLowerCase();
            if (!allowedExtensions.includes(extension)) return false;
        }
        
        return true;
    }

    /**
     * Valide une couleur HEX
     * @param {string} color - Couleur HEX
     * @returns {boolean} - True si valide
     */
    static isValidHexColor(color) {
        if (!color) return false;
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return hexRegex.test(color);
    }

    /**
     * Valide un code de langue ISO 639-1
     * @param {string} languageCode - Code de langue
     * @returns {boolean} - True si valide
     */
    static isValidLanguageCode(languageCode) {
        if (!languageCode || languageCode.length !== 2) return false;
        return /^[a-z]{2}$/.test(languageCode.toLowerCase());
    }

    /**
     * Valide un pourcentage
     * @param {number} percentage - Pourcentage
     * @returns {boolean} - True si valide
     */
    static isValidPercentage(percentage) {
        if (typeof percentage !== 'number' || isNaN(percentage)) return false;
        return percentage >= 0 && percentage <= 100;
    }

    /**
     * Valide une URL de fichier
     * @param {string} url - URL de fichier
     * @param {Array} allowedExtensions - Extensions autorisées
     * @returns {boolean} - True si valide
     */
    static isValidFileUrl(url, allowedExtensions = []) {
        if (!validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
            return false;
        }
        
        if (allowedExtensions.length > 0) {
            const extension = url.split('.').pop().toLowerCase();
            if (!allowedExtensions.includes(extension)) return false;
        }
        
        return true;
    }

    /**
     * Valide un nom d'utilisateur
     * @param {string} username - Nom d'utilisateur
     * @returns {boolean} - True si valide
     */
    static isValidUsername(username) {
        if (!username || username.length < 3 || username.length > 30) return false;
        
        // Lettres, chiffres, tirets et underscores uniquement
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        return usernameRegex.test(username);
    }

    /**
     * Valide une description
     * @param {string} description - Description
     * @param {Object} options - Options de validation
     * @returns {boolean} - True si valide
     */
    static isValidDescription(description, options = {}) {
        const { minLength = 0, maxLength = 5000 } = options;
        
        if (typeof description !== 'string') return false;
        if (description.length < minLength) return false;
        if (description.length > maxLength) return false;
        
        return true;
    }

    /**
     * Valide une URL de média social
     * @param {string} url - URL de média social
     * @param {string} platform - Plateforme (facebook, twitter, linkedin, etc.)
     * @returns {boolean} - True si valide
     */
    static isValidSocialMediaUrl(url, platform) {
        if (!url || !platform) return false;
        
        const platformPatterns = {
            facebook: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]+)/,
            twitter: /(?:https?:\/\/)?(?:www\.)?twitter\.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-]+)/,
            linkedin: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company|school)\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-]+)/,
            instagram: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]+)/,
            youtube: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:channel\/|user\/|c\/)?([\w\-]+)/
        };
        
        const pattern = platformPatterns[platform.toLowerCase()];
        if (!pattern) return validator.isURL(url);
        
        return pattern.test(url);
    }
}

module.exports = CustomValidator;