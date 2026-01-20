import { useAuthStore } from '@/stores/auth'

export function useErrorHandler(toast, router) {
  const authStore = useAuthStore()
  
  const handleApiError = (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message
    
    switch (status) {
      case 401:
        // Non authentifié
        toast.error('Session expirée. Veuillez vous reconnecter.', {
          timeout: 3000
        })
        authStore.logout()
        router.push('/login')
        break
        
      case 403:
        // Non autorisé
        toast.warning('Accès non autorisé', {
          timeout: 4000
        })
        router.push('/dashboard')
        break
        
      case 404:
        // Ressource non trouvée
        toast.error('Ressource non trouvée', {
          timeout: 3000
        })
        break
        
      case 422:
        // Erreur de validation
        const validationErrors = error.response?.data?.errors
        if (validationErrors) {
          Object.values(validationErrors).forEach(err => {
            toast.error(err[0], { timeout: 4000 })
          })
        } else {
          toast.error(message || 'Données invalides')
        }
        break
        
      case 429:
        // Trop de requêtes
        toast.warning('Trop de requêtes. Veuillez patienter.', {
          timeout: 5000
        })
        break
        
      case 500:
        // Erreur serveur
        toast.error('Erreur serveur. Veuillez réessayer plus tard.', {
          timeout: 5000
        })
        break
        
      default:
        toast.error(message || 'Erreur de connexion', {
          timeout: 4000
        })
    }
  }
  
  const handleNetworkError = () => {
    toast.error('Problème de connexion internet. Vérifiez votre réseau.', {
      timeout: 5000,
      closeButton: true
    })
  }
  
  return {
    handleApiError,
    handleNetworkError
  }
}