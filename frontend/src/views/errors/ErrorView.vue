<template>
  <div class="error-view">
    <div class="container">
      <div class="error-container">
        <!-- Illustration dynamique selon le type d'erreur -->
        <div class="error-illustration">
          <div class="illustration-wrapper">
            <div class="error-icon" :class="errorType">
              <i :class="errorIcon"></i>
            </div>
            <div class="error-orbits">
              <div class="orbit orbit-1"></div>
              <div class="orbit orbit-2"></div>
              <div class="orbit orbit-3"></div>
            </div>
          </div>
        </div>

        <!-- Contenu de l'erreur -->
        <div class="error-content">
          <div class="error-header">
            <h1 class="error-title">{{ errorTitle }}</h1>
            <div class="error-code" v-if="errorCode">
              Code d'erreur: <span>{{ errorCode }}</span>
            </div>
          </div>

          <div class="error-body">
            <p class="error-message">{{ errorMessage }}</p>

            <!-- Détails techniques (développeur) -->
            <div v-if="showTechnicalDetails" class="technical-details">
              <button class="btn-toggle-details" @click="toggleDetails">
                <i :class="showDetails ? 'icon-chevron-up' : 'icon-chevron-down'"></i>
                Détails techniques
              </button>

              <div v-if="showDetails" class="details-content">
                <div class="detail-item">
                  <span class="detail-label">URL:</span>
                  <span class="detail-value">{{ currentUrl }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Timestamp:</span>
                  <span class="detail-value">{{ timestamp }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">User Agent:</span>
                  <span class="detail-value">{{ userAgent }}</span>
                </div>
                <div v-if="errorDetails" class="detail-item">
                  <span class="detail-label">Stack Trace:</span>
                  <pre class="stack-trace">{{ errorDetails }}</pre>
                </div>
                <button class="btn-copy-details" @click="copyTechnicalDetails">
                  <i class="icon-copy"></i>
                  Copier les détails
                </button>
              </div>
            </div>

            <!-- Actions suggérées -->
            <div class="suggested-actions">
              <h3>Que faire maintenant ?</h3>
              <div class="actions-grid">
                <button
                    v-for="action in suggestedActions"
                    :key="action.label"
                    class="action-card"
                    :class="action.type"
                    @click="executeAction(action)"
                >
                  <i :class="action.icon"></i>
                  <div class="action-content">
                    <h4>{{ action.label }}</h4>
                    <p>{{ action.description }}</p>
                  </div>
                  <i class="action-arrow icon-arrow-right"></i>
                </button>
              </div>
            </div>

            <!-- Formulaire de rapport -->
            <div v-if="!errorReported" class="report-section">
              <h3>Signaler ce problème</h3>
              <p class="report-description">
                Aidez-nous à améliorer la plateforme en signalant cette erreur.
                Notre équipe technique sera notifiée immédiatement.
              </p>

              <div class="report-form">
                <div class="form-group">
                  <label for="reportDescription">Description supplémentaire (optionnel)</label>
                  <textarea
                      id="reportDescription"
                      v-model="reportDescription"
                      placeholder="Décrivez ce que vous faisiez lorsque l'erreur est survenue..."
                      rows="3"
                      class="form-textarea"
                  ></textarea>
                </div>

                <div class="form-group">
                  <label class="checkbox-label">
                    <input
                        type="checkbox"
                        v-model="includeScreenshot"
                        class="checkbox-input"
                    >
                    <span class="checkbox-custom"></span>
                    Inclure une capture d'écran
                  </label>
                </div>

                <div class="form-group">
                  <label class="checkbox-label">
                    <input
                        type="checkbox"
                        v-model="allowContact"
                        class="checkbox-input"
                    >
                    <span class="checkbox-custom"></span>
                    Autoriser le support à me contacter
                  </label>
                </div>

                <div class="form-actions">
                  <button
                      class="btn-report"
                      @click="submitErrorReport"
                      :disabled="reporting"
                  >
                    <i class="icon-send"></i>
                    {{ reporting ? 'Envoi en cours...' : 'Signaler l\'erreur' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Confirmation de rapport -->
            <div v-else class="report-confirmation">
              <div class="confirmation-icon">
                <i class="icon-check-circle"></i>
              </div>
              <h3>Merci pour votre rapport !</h3>
              <p>Notre équipe technique a été notifiée et examinera ce problème rapidement.</p>
              <div class="confirmation-details">
                <div class="detail">
                  <i class="icon-clock"></i>
                  <span>Ticket #{{ ticketNumber }} créé</span>
                </div>
                <div class="detail">
                  <i class="icon-mail"></i>
                  <span>Confirmation envoyée à votre email</span>
                </div>
              </div>
            </div>

            <!-- Contact direct -->
            <div class="contact-section">
              <h3>Besoin d'aide immédiate ?</h3>
              <div class="contact-options">
                <a :href="`mailto:${supportEmail}`" class="contact-option">
                  <i class="icon-mail"></i>
                  <div class="option-content">
                    <h4>Email de support</h4>
                    <p>{{ supportEmail }}</p>
                  </div>
                </a>
                <a :href="`tel:${supportPhone}`" class="contact-option">
                  <i class="icon-phone"></i>
                  <div class="option-content">
                    <h4>Téléphone</h4>
                    <p>{{ supportPhone }}</p>
                  </div>
                </a>
                <button class="contact-option" @click="openLiveChat">
                  <i class="icon-message-square"></i>
                  <div class="option-content">
                    <h4>Chat en direct</h4>
                    <p>Disponible 24/7</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Actions de navigation -->
          <div class="navigation-actions">
            <button class="btn-nav" @click="goHome">
              <i class="icon-home"></i>
              Accueil
            </button>
            <button class="btn-nav" @click="goBack">
              <i class="icon-arrow-left"></i>
              Retour
            </button>
            <button class="btn-nav" @click="refreshPage">
              <i class="icon-refresh-cw"></i>
              Actualiser
            </button>
            <button class="btn-nav" @click="openHelpCenter">
              <i class="icon-help-circle"></i>
              Centre d'aide
            </button>
          </div>

          <!-- Informations système -->
          <div class="system-info">
            <div class="info-item">
              <i class="icon-clock"></i>
              <span>Dernière vérification: {{ lastCheck }}</span>
            </div>
            <div class="info-item">
              <i class="icon-server"></i>
              <span>Statut serveur: <span class="status online">Opérationnel</span></span>
            </div>
            <div class="info-item">
              <i class="icon-shield"></i>
              <span>Incident connu: {{ hasKnownIssue ? 'Oui' : 'Non' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Paramètres d'erreur
const errorType = ref(route.query.type || 'server')
const errorCode = ref(route.query.code || '500')
const errorMessage = ref(route.query.message || 'Une erreur interne est survenue.')
const errorDetails = ref(route.query.details || null)

// États UI
const showDetails = ref(false)
const showTechnicalDetails = ref(false)
const errorReported = ref(false)
const reporting = ref(false)
const reportDescription = ref('')
const includeScreenshot = ref(false)
const allowContact = ref(false)
const ticketNumber = ref(`TICKET-${Date.now().toString().slice(-6)}`)

// Données de support
const supportEmail = ref('support@educours.com')
const supportPhone = ref('+33 1 23 45 67 89')
const lastCheck = ref(new Date().toLocaleTimeString('fr-FR'))
const hasKnownIssue = ref(false)

// Calcul des propriétés
const errorTitle = computed(() => {
  const titles = {
    'server': 'Erreur Serveur',
    'network': 'Problème de Connexion',
    'timeout': 'Délai Dépassé',
    'access': 'Accès Refusé',
    'maintenance': 'Maintenance en Cours',
    'default': 'Erreur Technique'
  }
  return titles[errorType.value] || titles.default
})

const errorIcon = computed(() => {
  const icons = {
    'server': 'icon-server',
    'network': 'icon-wifi-off',
    'timeout': 'icon-clock',
    'access': 'icon-lock',
    'maintenance': 'icon-tool',
    'default': 'icon-alert-triangle'
  }
  return icons[errorType.value] || icons.default
})

const suggestedActions = computed(() => {
  const baseActions = [
    {
      label: 'Actualiser la page',
      description: 'Tentez de recharger la page',
      icon: 'icon-refresh-cw',
      type: 'refresh',
      action: 'refresh'
    },
    {
      label: 'Vérifier la connexion',
      description: 'Assurez-vous d\'être connecté à Internet',
      icon: 'icon-wifi',
      type: 'network',
      action: 'checkNetwork'
    },
    {
      label: 'Effacer le cache',
      description: 'Supprimez les données temporaires du navigateur',
      icon: 'icon-trash',
      type: 'cache',
      action: 'clearCache'
    }
  ]

  if (errorType.value === 'access') {
    baseActions.push({
      label: 'Se connecter',
      description: 'Accédez à votre compte',
      icon: 'icon-log-in',
      type: 'auth',
      action: 'login'
    })
  }

  if (errorType.value === 'maintenance') {
    baseActions.push({
      label: 'Voir le planning',
      description: 'Consultez les horaires de maintenance',
      icon: 'icon-calendar',
      type: 'info',
      action: 'schedule'
    })
  }

  baseActions.push({
    label: 'Centre d\'aide',
    description: 'Consultez notre base de connaissances',
    icon: 'icon-help-circle',
    type: 'help',
    action: 'help'
  })

  return baseActions
})

const currentUrl = ref(window.location.href)
const timestamp = ref(new Date().toISOString())
const userAgent = ref(navigator.userAgent)

// Méthodes
const toggleDetails = () => {
  showDetails.value = !showDetails.value
  if (showDetails.value && !showTechnicalDetails.value) {
    showTechnicalDetails.value = true
  }
}

const copyTechnicalDetails = async () => {
  const details = {
    url: currentUrl.value,
    timestamp: timestamp.value,
    userAgent: userAgent.value,
    errorCode: errorCode.value,
    errorType: errorType.value,
    errorMessage: errorMessage.value,
    errorDetails: errorDetails.value
  }

  try {
    await navigator.clipboard.writeText(JSON.stringify(details, null, 2))
    alert('Détails techniques copiés !')
  } catch (err) {
    console.error('Erreur de copie:', err)
  }
}

const executeAction = (action) => {
  switch (action.action) {
    case 'refresh':
      refreshPage()
      break
    case 'checkNetwork':
      checkNetworkConnection()
      break
    case 'clearCache':
      clearBrowserCache()
      break
    case 'login':
      router.push('/login')
      break
    case 'schedule':
      router.push('/maintenance/schedule')
      break
    case 'help':
      router.push('/help')
      break
  }
}

const refreshPage = () => {
  window.location.reload()
}

const checkNetworkConnection = () => {
  if (!navigator.onLine) {
    alert('Vous semblez être hors ligne. Vérifiez votre connexion Internet.')
  } else {
    alert('Votre connexion Internet semble fonctionner correctement.')
  }
}

const clearBrowserCache = () => {
  if (confirm('Voulez-vous vraiment effacer le cache du navigateur ?')) {
    // Note: En production, vous utiliseriez une API backend pour gérer le cache
    localStorage.removeItem('cacheTimestamp')
    sessionStorage.clear()
    alert('Cache effacé. Veuillez actualiser la page.')
  }
}

const submitErrorReport = async () => {
  reporting.value = true

  try {
    // Simuler l'envoi du rapport
    await new Promise(resolve => setTimeout(resolve, 1500))

    const report = {
      ticketNumber: ticketNumber.value,
      errorType: errorType.value,
      errorCode: errorCode.value,
      description: reportDescription.value,
      includeScreenshot: includeScreenshot.value,
      allowContact: allowContact.value,
      timestamp: timestamp.value,
      url: currentUrl.value
    }

    // Enregistrer localement (en production, envoyer à l'API)
    localStorage.setItem(`errorReport_${ticketNumber.value}`, JSON.stringify(report))

    errorReported.value = true

    // Suivi analytique
    console.log('Error report submitted:', report)

  } catch (error) {
    console.error('Error submitting report:', error)
    alert('Échec de l\'envoi du rapport. Veuillez réessayer.')
  } finally {
    reporting.value = false
  }
}

const openLiveChat = () => {
  // Intégration avec un service de chat en direct
  alert('Ouverture du chat en direct...')
  // window.open('https://chat.educours.com', '_blank')
}

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

const openHelpCenter = () => {
  router.push('/help')
}

// Initialisation
onMounted(() => {
  // Vérifier si l'utilisateur est un développeur
  const isDeveloper = localStorage.getItem('developerMode') === 'true'
  showTechnicalDetails.value = isDeveloper

  // Vérifier les incidents connus
  checkKnownIssues()

  // Suivi des erreurs
  trackError()
})

const checkKnownIssues = async () => {
  try {
    // En production, vérifier auprès d'une API
    const response = await fetch('/api/health/known-issues')
    const data = await response.json()
    hasKnownIssue.value = data.hasIssues || false
  } catch (error) {
    console.error('Error checking known issues:', error)
  }
}

const trackError = () => {
  // Envoyer l'erreur à votre service d'analytique
  console.error('Error tracked:', {
    type: errorType.value,
    code: errorCode.value,
    message: errorMessage.value,
    url: currentUrl.value
  })
}
</script>

<style scoped>
.error-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.error-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
  align-items: center;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  overflow: hidden;
}

@media (max-width: 992px) {
  .error-container {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2rem;
  }
}

.error-illustration {
  display: flex;
  justify-content: center;
  align-items: center;
}

.illustration-wrapper {
  position: relative;
  width: 250px;
  height: 250px;
}

.error-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  z-index: 2;
  animation: pulse 2s infinite;
}

.error-icon.server {
  background: linear-gradient(135deg, #f56565 0%, #ed8936 100%);
  color: white;
}

.error-icon.network {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.error-icon.timeout {
  background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
  color: white;
}

.error-icon.access {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
}

.error-icon.maintenance {
  background: linear-gradient(135deg, #9f7aea 0%, #805ad5 100%);
  color: white;
}

.error-icon.default {
  background: linear-gradient(135deg, #718096 0%, #4a5568 100%);
  color: white;
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.05);
    box-shadow: 0 0 0 20px rgba(0, 0, 0, 0);
  }
}

.error-orbits {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.orbit {
  position: absolute;
  border: 2px dashed rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.orbit-1 {
  width: 150px;
  height: 150px;
  animation: rotate 20s linear infinite;
}

.orbit-2 {
  width: 200px;
  height: 200px;
  animation: rotate 30s linear infinite reverse;
}

.orbit-3 {
  width: 250px;
  height: 250px;
  animation: rotate 40s linear infinite;
}

@keyframes rotate {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.error-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.error-header {
  margin-bottom: 1rem;
}

.error-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.error-code {
  font-size: 1rem;
  color: #718096;
}

.error-code span {
  font-family: monospace;
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  color: #f56565;
  font-weight: 600;
}

.error-body {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.error-message {
  font-size: 1.1rem;
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
}

.technical-details {
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
}

.btn-toggle-details {
  width: 100%;
  padding: 1rem 1.5rem;
  background: #e9ecef;
  border: none;
  text-align: left;
  font-weight: 600;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-toggle-details:hover {
  background: #dee2e6;
}

.details-content {
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.detail-item {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-weight: 600;
  color: #495057;
  font-size: 0.875rem;
}

.detail-value {
  font-family: monospace;
  font-size: 0.875rem;
  color: #718096;
  word-break: break-all;
}

.stack-trace {
  background: #1a202c;
  color: #cbd5e0;
  padding: 1rem;
  border-radius: 6px;
  font-size: 0.75rem;
  line-height: 1.5;
  overflow-x: auto;
  margin: 0;
}

.btn-copy-details {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy-details:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.suggested-actions h3 {
  font-size: 1.25rem;
  color: #2d3748;
  margin: 0 0 1rem 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (max-width: 768px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

.action-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.1);
}

.action-card.refresh {
  border-left-color: #667eea;
}

.action-card.network {
  border-left-color: #48bb78;
}

.action-card.cache {
  border-left-color: #ed8936;
}

.action-card.auth {
  border-left-color: #9f7aea;
}

.action-card.info {
  border-left-color: #f6ad55;
}

.action-card.help {
  border-left-color: #4299e1;
}

.action-card i:first-child {
  font-size: 1.5rem;
  color: #667eea;
}

.action-content {
  flex: 1;
}

.action-content h4 {
  font-size: 1rem;
  color: #2d3748;
  margin: 0 0 0.25rem 0;
}

.action-content p {
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
}

.action-arrow {
  color: #cbd5e0;
  transition: all 0.2s;
}

.action-card:hover .action-arrow {
  color: #667eea;
  transform: translateX(4px);
}

.report-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
}

.report-section h3 {
  font-size: 1.25rem;
  color: #2d3748;
  margin: 0 0 1rem 0;
}

.report-description {
  color: #718096;
  margin: 0 0 1.5rem 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.report-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #495057;
  font-size: 0.875rem;
}

.form-textarea {
  padding: 0.75rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
}

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #dee2e6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.checkbox-input:checked + .checkbox-custom {
  background: #667eea;
  border-color: #667eea;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  color: white;
  font-size: 0.875rem;
}

.form-actions {
  margin-top: 1rem;
}

.btn-report {
  padding: 0.875rem 1.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-report:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.btn-report:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.report-confirmation {
  text-align: center;
  padding: 2rem;
  background: #d4edda;
  border-radius: 12px;
  border: 1px solid #c3e6cb;
}

.confirmation-icon {
  width: 64px;
  height: 64px;
  background: #28a745;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: white;
  font-size: 2rem;
}

.report-confirmation h3 {
  font-size: 1.5rem;
  color: #155724;
  margin: 0 0 1rem 0;
}

.report-confirmation p {
  color: #155724;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.confirmation-details {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.confirmation-details .detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #155724;
  font-size: 0.875rem;
}

.confirmation-details .detail i {
  font-size: 1rem;
}

.contact-section {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
}

.contact-section h3 {
  font-size: 1.25rem;
  color: #2d3748;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.contact-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 768px) {
  .contact-options {
    grid-template-columns: 1fr;
  }
}

.contact-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.contact-option:hover {
  background: white;
  border-color: #667eea;
  transform: translateY(-2px);
}

.contact-option i {
  font-size: 1.5rem;
  color: #667eea;
}

.option-content h4 {
  font-size: 1rem;
  color: #2d3748;
  margin: 0 0 0.25rem 0;
}

.option-content p {
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
}

.navigation-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  padding-top: 2rem;
  border-top: 2px solid #e9ecef;
}

.btn-nav {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  color: #495057;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-nav:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
  transform: translateY(-2px);
}

.system-info {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  font-size: 0.875rem;
  color: #718096;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-item i {
  color: #667eea;
}

.status.online {
  color: #48bb78;
  font-weight: 600;
}
</style>