// backend/src/utils/helpers.js
const crypto = require('crypto');
const path = require('path');

class Helpers {
    /**
     * Génère une chaîne aléatoire sécurisée
     * @param {number} length - Longueur de la chaîne
     * @returns {string} - Chaîne aléatoire
     */
    static generateRandomString(length = 32) {
        return crypto.randomBytes(Math.ceil(length / 2))
            .toString('hex')
            .slice(0, length);
    }

    /**
     * Formate une date pour l'affichage
     * @param {Date} date - Date à formater
     * @returns {string} - Date formatée
     */
    static formatDate(date) {
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Calcule le pourcentage de progression
     * @param {number} completed - Nombre d'éléments complétés
     * @param {number} total - Nombre total d'éléments
     * @returns {number} - Pourcentage arrondi
     */
    static calculateProgress(completed, total) {
        if (total === 0) return 0;
        return Math.round((completed / total) * 100);
    }

    /**
     * Extrait l'extension d'un fichier
     * @param {string} filename - Nom du fichier
     * @returns {string} - Extension du fichier
     */
    static getFileExtension(filename) {
        return path.extname(filename).toLowerCase();
    }

    /**
     * Valide une adresse email
     * @param {string} email - Email à valider
     * @returns {boolean} - True si valide
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Formate le prix avec devise
     * @param {number} amount - Montant
     * @param {string} currency - Devise (par défaut: XOF)
     * @returns {string} - Prix formaté
     */
    static formatPrice(amount, currency = 'XOF') {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    /**
     * Truncate text with ellipsis
     * @param {string} text - Texte à tronquer
     * @param {number} maxLength - Longueur maximale
     * @returns {string} - Texte tronqué
     */
    static truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }

    /**
     * Génère un slug à partir d'un texte
     * @param {string} text - Texte à convertir en slug
     * @returns {string} - Slug généré
     */
    static generateSlug(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim();
    }

    /**
     * Calcule la durée en format lisible
     * @param {number} seconds - Secondes
     * @returns {string} - Durée formatée
     */
    static formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }
}

module.exports = Helpers;