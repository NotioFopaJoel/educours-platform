// frontend/src/router/guards.js
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notifications';
import { useRouter } from 'vue-router';

/**
 * @description Guard d'authentification globale
 * Vérifie si l'utilisateur est connecté et a les permissions nécessaires
 */
export const setupAuthGuards = (router) => {
    const authStore = useAuthStore();
    const notificationStore = useNotificationStore();

    // Middleware global avant chaque route
    router.beforeEach(async (to, from, next) => {
        console.log(`[Router] Navigation: ${from.fullPath} -> ${to.fullPath}`);

        // Initialiser l'authentification si nécessaire
        if (!authStore.isInitialized) {
            console.log('[Auth] Initialisation de l\'authentification...');
            await authStore.initialize();
        }

        // Vérifier si la route nécessite une authentification
        const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
        const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
        const requiredRole = to.meta.role;
        const requiredPermissions = to.meta.permissions || [];

        // Récupérer l'état d'authentification
        const isAuthenticated = authStore.isAuthenticated;
        const userRole = authStore.user?.role;
        const userPermissions = authStore.user?.permissions || [];

        console.log(`[Auth] Statut: ${isAuthenticated ? 'Connecté' : 'Non connecté'}`);
        console.log(`[Auth] Rôle: ${userRole || 'Aucun'}`);

        // === CAS 1: Route pour invités seulement ===
        if (requiresGuest && isAuthenticated) {
            console.log('[Guard] Redirection: Connecté vers dashboard');

            // Rediriger selon le rôle
            switch (userRole) {
                case 'admin':
                    return next({ name: 'admin-dashboard' });
                case 'teacher':
                    return next({ name: 'teacher-dashboard' });
                case 'student':
                    return next({ name: 'student-dashboard' });
                default:
                    return next({ name: 'dashboard' });
            }
        }

        // === CAS 2: Route protégée nécessitant authentification ===
        if (requiresAuth) {
            // Si non authentifié, rediriger vers login
            if (!isAuthenticated) {
                console.log('[Guard] Accès refusé: Non authentifié');

                // Sauvegarder la route demandée pour redirection après login
                const redirectPath = to.fullPath !== '/' ? to.fullPath : undefined;

                notificationStore.showWarning({
                    title: 'Accès restreint',
                    message: 'Vous devez être connecté pour accéder à cette page',
                    duration: 3000
                });

                return next({
                    name: 'login',
                    query: { redirect: redirectPath }
                });
            }

            // Vérifier les permissions de rôle
            if (requiredRole && userRole !== requiredRole) {
                console.log(`[Guard] Permission refusée: Rôle ${userRole} ≠ ${requiredRole}`);

                notificationStore.showError({
                    title: 'Accès interdit',
                    message: 'Vous n\'avez pas les permissions nécessaires',
                    duration: 4000
                });

                // Rediriger vers le dashboard approprié
                switch (userRole) {
                    case 'admin':
                        return next({ name: 'admin-dashboard' });
                    case 'teacher':
                        return next({ name: 'teacher-dashboard' });
                    case 'student':
                        return next({ name: 'student-dashboard' });
                    default:
                        return next({ name: 'dashboard' });
                }
            }

            // Vérifier les permissions spécifiques
            if (requiredPermissions.length > 0) {
                const hasAllPermissions = requiredPermissions.every(permission =>
                    userPermissions.includes(permission)
                );

                if (!hasAllPermissions) {
                    console.log('[Guard] Permissions insuffisantes');

                    notificationStore.showError({
                        title: 'Permissions insuffisantes',
                        message: 'Vous ne disposez pas des droits nécessaires',
                        duration: 4000
                    });

                    return next({ name: 'unauthorized' });
                }
            }

            // Vérifier si le compte est vérifié (pour certaines routes)
            if (to.meta.requiresVerified && !authStore.user?.isVerified) {
                console.log('[Guard] Compte non vérifié');

                notificationStore.showWarning({
                    title: 'Vérification requise',
                    message: 'Veuillez vérifier votre email avant de continuer',
                    duration: 5000
                });

                return next({ name: 'verify-email' });
            }

            // Vérifier si le compte est actif
            if (!authStore.user?.isActive) {
                console.log('[Guard] Compte désactivé');

                notificationStore.showError({
                    title: 'Compte désactivé',
                    message: 'Votre compte a été désactivé. Contactez l\'administration.',
                    duration: 6000
                });

                return next({ name: 'account-suspended' });
            }
        }

        // === CAS 3: Vérifier la session expire bientôt ===
        if (isAuthenticated && authStore.isTokenExpiringSoon()) {
            console.log('[Guard] Token expirant bientôt, tentative de rafraîchissement');

            try {
                await authStore.refreshToken();
                console.log('[Guard] Token rafraîchi avec succès');
            } catch (error) {
                console.warn('[Guard] Échec rafraîchissement token:', error.message);
                // Continuer quand même, l'utilisateur sera déconnecté à l'expiration
            }
        }

        // === CAS 4: Vérifier les paramètres de query spéciaux ===
        if (to.query.logout === 'true') {
            console.log('[Guard] Logout via query param');
            await authStore.logout();
            return next({ name: 'login' });
        }

        if (to.query.session_expired === 'true') {
            notificationStore.showWarning({
                title: 'Session expirée',
                message: 'Votre session a expiré. Veuillez vous reconnecter.',
                duration: 5000
            });

            // Nettoyer l'URL
            const { session_expired, ...queryWithoutParam } = to.query;
            return next({ ...to, query: queryWithoutParam });
        }

        // === CAS 5: Toutes les vérifications passées ===
        console.log('[Guard] Navigation autorisée');
        next();
    });

    // Middleware après navigation (pour analytics/tracking)
    router.afterEach((to, from) => {
        // Enregistrer la visite pour analytics
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('config', 'G-XXXXXXXXXX', {
                page_path: to.path,
                page_title: to.meta.title || 'EDUCOURS'
            });
        }

        // Scroll vers le haut
        window.scrollTo(0, 0);

        // Mettre à jour le titre de la page
        const appName = 'EDUCOURS';
        const pageTitle = to.meta.title || 'Plateforme d\'éducation en ligne';
        document.title = pageTitle ? `${pageTitle} | ${appName}` : appName;
    });

    // Gestion des erreurs de navigation
    router.onError((error) => {
        console.error('[Router] Erreur de navigation:', error);

        notificationStore.showError({
            title: 'Erreur de navigation',
            message: 'Impossible de charger la page demandée',
            duration: 4000
        });
    });
};

/**
 * @description Guard pour vérifier si l'utilisateur peut accéder à une route admin
 */
export const adminGuard = (to, from, next) => {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
        return next({ name: 'login', query: { redirect: to.fullPath } });
    }

    if (authStore.user?.role !== 'admin') {
        const notificationStore = useNotificationStore();
        notificationStore.showError({
            title: 'Accès refusé',
            message: 'Cette zone est réservée aux administrateurs',
            duration: 4000
        });

        return next({ name: 'dashboard' });
    }

    next();
};

/**
 * @description Guard pour vérifier si l'utilisateur peut accéder à une route teacher
 */
export const teacherGuard = (to, from, next) => {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
        return next({ name: 'login', query: { redirect: to.fullPath } });
    }

    if (!['teacher', 'admin'].includes(authStore.user?.role)) {
        const notificationStore = useNotificationStore();
        notificationStore.showError({
            title: 'Accès refusé',
            message: 'Cette zone est réservée aux enseignants',
            duration: 4000
        });

        return next({ name: 'dashboard' });
    }

    next();
};

/**
 * @description Guard pour vérifier si l'utilisateur peut accéder à une route student
 */
export const studentGuard = (to, from, next) => {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
        return next({ name: 'login', query: { redirect: to.fullPath } });
    }

    if (!['student', 'admin'].includes(authStore.user?.role)) {
        const notificationStore = useNotificationStore();
        notificationStore.showError({
            title: 'Accès refusé',
            message: 'Cette zone est réservée aux étudiants',
            duration: 4000
        });

        return next({ name: 'dashboard' });
    }

    next();
};

/**
 * @description Guard pour vérifier si l'utilisateur a vérifié son email
 */
export const verifiedEmailGuard = (to, from, next) => {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
        return next({ name: 'login', query: { redirect: to.fullPath } });
    }

    if (!authStore.user?.isVerified) {
        const notificationStore = useNotificationStore();
        notificationStore.showWarning({
            title: 'Vérification requise',
            message: 'Veuillez vérifier votre adresse email avant de continuer',
            duration: 5000
        });

        return next({ name: 'verify-email' });
    }

    next();
};

/**
 * @description Guard pour les routes de maintenance
 */
export const maintenanceGuard = (to, from, next) => {
    const maintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';
    const authStore = useAuthStore();

    if (maintenanceMode && authStore.user?.role !== 'admin') {
        return next({ name: 'maintenance' });
    }

    next();
};

/**
 * @description Guard pour vérifier les permissions spécifiques
 * @param {string[]} requiredPermissions - Liste des permissions requises
 */
export const createPermissionGuard = (requiredPermissions) => {
    return (to, from, next) => {
        const authStore = useAuthStore();

        if (!authStore.isAuthenticated) {
            return next({ name: 'login', query: { redirect: to.fullPath } });
        }

        const userPermissions = authStore.user?.permissions || [];
        const hasAllPermissions = requiredPermissions.every(permission =>
            userPermissions.includes(permission)
        );

        if (!hasAllPermissions) {
            const notificationStore = useNotificationStore();
            notificationStore.showError({
                title: 'Permissions insuffisantes',
                message: 'Vous ne disposez pas des droits nécessaires',
                duration: 4000
            });

            return next({ name: 'unauthorized' });
        }

        next();
    };
};

/**
 * @description Guard pour les routes qui nécessitent un abonnement actif
 */
export const subscriptionGuard = (to, from, next) => {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
        return next({ name: 'login', query: { redirect: to.fullPath } });
    }

    // Vérifier si l'utilisateur a un abonnement actif
    const hasActiveSubscription = authStore.user?.subscription?.isActive;

    if (!hasActiveSubscription) {
        const notificationStore = useNotificationStore();
        notificationStore.showWarning({
            title: 'Abonnement requis',
            message: 'Cette fonctionnalité nécessite un abonnement actif',
            duration: 5000
        });

        return next({ name: 'subscription-plans' });
    }

    next();
};

/**
 * @description Guard pour les routes de paiement
 */
export const paymentGuard = (to, from, next) => {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
        return next({ name: 'login', query: { redirect: to.fullPath } });
    }

    // Vérifier si l'utilisateur a une méthode de paiement enregistrée
    const hasPaymentMethod = authStore.user?.paymentMethods?.length > 0;

    if (!hasPaymentMethod && to.name !== 'add-payment-method') {
        const notificationStore = useNotificationStore();
        notificationStore.showInfo({
            title: 'Méthode de paiement requise',
            message: 'Veuillez ajouter une méthode de paiement pour continuer',
            duration: 5000
        });

        return next({ name: 'add-payment-method', query: { redirect: to.fullPath } });
    }

    next();
};

/**
 * @description Utilitaire pour ajouter des métadonnées aux routes
 */
export const withMeta = (meta) => ({
    meta: {
        requiresAuth: true,
        ...meta
    }
});

/**
 * @description Exporter tous les guards
 */
export default {
    setupAuthGuards,
    adminGuard,
    teacherGuard,
    studentGuard,
    verifiedEmailGuard,
    maintenanceGuard,
    createPermissionGuard,
    subscriptionGuard,
    paymentGuard,
    withMeta
};