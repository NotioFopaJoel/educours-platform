<template>
  <BaseLayout>
    <div class="payment-success-view">
      <div class="container">
        <!-- Confirmation principale -->
        <div class="success-container">
          <!-- Animation/Icone de succès -->
          <div class="success-animation">
            <div class="checkmark-animation">
              <div class="checkmark-circle">
                <div class="checkmark-stem"></div>
                <div class="checkmark-kick"></div>
              </div>
            </div>
            <div class="confetti">
              <div class="confetti-piece" v-for="i in 12" :key="i" :style="confettiStyle(i)"></div>
            </div>
          </div>

          <!-- Message de succès -->
          <div class="success-message">
            <h1 class="success-title">
              <i class="icon-check-circle"></i>
              Paiement confirmé !
            </h1>
            <p class="success-subtitle">
              Votre commande a été traitée avec succès. Vous avez maintenant accès au cours.
            </p>
            <div class="order-number">
              <span>Numéro de commande :</span>
              <strong>{{ orderNumber }}</strong>
              <button class="btn-copy" @click="copyOrderNumber">
                <i class="icon-copy"></i>
              </button>
            </div>
          </div>

          <!-- Récapitulatif de commande -->
          <div class="order-summary">
            <div class="summary-header">
              <h2>Récapitulatif de votre commande</h2>
              <div class="order-date">{{ formattedDate }}</div>
            </div>

            <div class="summary-content">
              <!-- Cours -->
              <div class="summary-item">
                <div class="item-header">
                  <h3>Cours</h3>
                  <span class="item-status paid">
                    <i class="icon-check"></i>
                    Payé
                  </span>
                </div>
                <div class="course-details">
                  <div class="course-thumbnail">
                    <img :src="course.thumbnail" :alt="course.title">
                  </div>
                  <div class="course-info">
                    <h4>{{ course.title }}</h4>
                    <p class="course-description">{{ course.description }}</p>
                    <div class="course-meta">
                      <span class="meta-item">
                        <i class="icon-user"></i>
                        {{ course.instructor }}
                      </span>
                      <span class="meta-item">
                        <i class="icon-clock"></i>
                        {{ course.duration }}
                      </span>
                      <span class="meta-item">
                        <i class="icon-play"></i>
                        {{ course.lessons }} leçons
                      </span>
                    </div>
                  </div>
                  <div class="course-price">
                    {{ formatPrice(course.price) }}
                  </div>
                </div>
              </div>

              <!-- Détails de paiement -->
              <div class="payment-details">
                <h3>Détails du paiement</h3>
                <div class="details-grid">
                  <div class="detail-item">
                    <span class="detail-label">Méthode de paiement :</span>
                    <span class="detail-value">
                      <i :class="paymentMethod.icon"></i>
                      {{ paymentMethod.name }}
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Date du paiement :</span>
                    <span class="detail-value">{{ formattedTime }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Montant total :</span>
                    <span class="detail-value total">{{ formatPrice(orderTotal) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Statut :</span>
                    <span class="detail-value status success">
                      <i class="icon-check"></i>
                      Complété
                    </span>
                  </div>
                </div>
              </div>

              <!-- Informations client -->
              <div class="customer-details">
                <h3>Informations client</h3>
                <div class="customer-grid">
                  <div class="customer-item">
                    <span class="customer-label">Nom :</span>
                    <span class="customer-value">{{ customerInfo.fullName }}</span>
                  </div>
                  <div class="customer-item">
                    <span class="customer-label">Email :</span>
                    <span class="customer-value">{{ customerInfo.email }}</span>
                  </div>
                  <div class="customer-item">
                    <span class="customer-label">Numéro de commande :</span>
                    <span class="customer-value">{{ orderNumber }}</span>
                  </div>
                </div>
              </div>

              <!-- Détails financiers -->
              <div class="financial-details">
                <div class="financial-item">
                  <span>Sous-total :</span>
                  <span>{{ formatPrice(course.price) }}</span>
                </div>
                <div class="financial-item" v-if="discountAmount > 0">
                  <span>Réduction :</span>
                  <span class="discount">-{{ formatPrice(discountAmount) }}</span>
                </div>
                <div class="financial-item">
                  <span>Frais de traitement :</span>
                  <span>{{ formatPrice(processingFee) }}</span>
                </div>
                <div class="financial-item">
                  <span>TVA ({{ vatRate }}%) :</span>
                  <span>{{ formatPrice(vatAmount) }}</span>
                </div>
                <div class="financial-item total">
                  <span>Total payé :</span>
                  <span>{{ formatPrice(orderTotal) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Étapes suivantes -->
          <div class="next-steps">
            <h2>Étapes suivantes</h2>
            <div class="steps-grid">
              <div class="step-card">
                <div class="step-icon">
                  <i class="icon-play"></i>
                </div>
                <h4>Commencer le cours</h4>
                <p>Accédez immédiatement au cours et commencez votre apprentissage</p>
                <router-link :to="`/courses/${course.id}`" class="btn-step">
                  <i class="icon-arrow-right"></i>
                  Accéder au cours
                </router-link>
              </div>
              <div class="step-card">
                <div class="step-icon">
                  <i class="icon-download"></i>
                </div>
                <h4>Télécharger la facture</h4>
                <p>Recevez votre facture par email ou téléchargez-la maintenant</p>
                <button class="btn-step" @click="downloadInvoice">
                  <i class="icon-download"></i>
                  Télécharger
                </button>
              </div>
              <div class="step-card">
                <div class="step-icon">
                  <i class="icon-mail"></i>
                </div>
                <h4>Vérifiez votre email</h4>
                <p>Nous avons envoyé un email de confirmation avec tous les détails</p>
                <button class="btn-step" @click="resendConfirmation">
                  <i class="icon-send"></i>
                  Renvoyer
                </button>
              </div>
              <div class="step-card">
                <div class="step-icon">
                  <i class="icon-settings"></i>
                </div>
                <h4>Configurer votre compte</h4>
                <p>Complétez votre profil pour une meilleure expérience d'apprentissage</p>
                <router-link to="/profile/edit" class="btn-step">
                  <i class="icon-user"></i>
                  Compléter le profil
                </router-link>
              </div>
            </div>
          </div>

          <!-- Garanties -->
          <div class="guarantees-section">
            <h2>Votre achat est protégé</h2>
            <div class="guarantees-grid">
              <div class="guarantee-card">
                <i class="icon-shield"></i>
                <div class="guarantee-content">
                  <h4>Garantie satisfait ou remboursé</h4>
                  <p>30 jours pour changer d'avis avec remboursement intégral</p>
                </div>
              </div>
              <div class="guarantee-card">
                <i class="icon-lock"></i>
                <div class="guarantee-content">
                  <h4>Paiement sécurisé</h4>
                  <p>Cryptage SSL 256 bits, vos données sont protégées</p>
                </div>
              </div>
              <div class="guarantee-card">
                <i class="icon-support"></i>
                <div class="guarantee-content">
                  <h4>Support 24/7</h4>
                  <p>Notre équipe est disponible pour vous aider à tout moment</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="success-actions">
            <div class="actions-left">
              <button class="btn-secondary" @click="printReceipt">
                <i class="icon-printer"></i>
                Imprimer le reçu
              </button>
              <button class="btn-secondary" @click="sharePurchase">
                <i class="icon-share"></i>
                Partager
              </button>
            </div>
            <div class="actions-right">
              <router-link to="/dashboard" class="btn-primary">
                <i class="icon-home"></i>
                Retour au tableau de bord
              </router-link>
              <router-link to="/courses" class="btn-secondary">
                <i class="icon-book"></i>
                Voir d'autres cours
              </router-link>
            </div>
          </div>

          <!-- Informations additionnelles -->
          <div class="additional-info">
            <div class="info-card">
              <h3><i class="icon-info"></i> Informations importantes</h3>
              <ul class="info-list">
                <li>
                  <i class="icon-check"></i>
                  Le cours est disponible immédiatement dans votre espace personnel
                </li>
                <li>
                  <i class="icon-check"></i>
                  Vous recevrez un email de confirmation sous 5 minutes
                </li>
                <li>
                  <i class="icon-check"></i>
                  Pour toute question, contactez le support à support@educours.com
                </li>
                <li>
                  <i class="icon-check"></i>
                  Consultez vos commandes dans la section "Historique des paiements"
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseLayout from '@/views/dashboard/BaseLayout.vue'
import { usePaymentStore } from '@/stores/payments'

const route = useRoute()
const router = useRouter()
const paymentStore = usePaymentStore()

// Données de commande
const orderNumber = ref(route.query.order || 'EDC' + Date.now())
const orderDate = ref(new Date())
const processingFee = ref(1.99)
const vatRate = ref(20)

// Données du cours
const course = ref({
  id: route.query.course || 1,
  title: 'JavaScript Avancé - Formation Complète',
  description: 'Maîtrisez JavaScript moderne avec les dernières fonctionnalités ES6+',
  thumbnail: '/images/course1.jpg',
  instructor: 'Dr. Jean Dupont',
  duration: '25 heures',
  lessons: 42,
  price: 199.99
})

// Informations client
const customerInfo = ref({
  fullName: 'Koffi Kouamé',
  email: 'koffi@educours.com'
})

// Informations de paiement
const paymentMethod = ref({
  name: 'Carte bancaire',
  icon: 'icon-credit-card',
  last4: '4242'
})

const discountAmount = ref(29.99)
const vatAmount = computed(() => {
  const subtotal = course.value.price - discountAmount.value
  return (subtotal * vatRate.value) / 100
})
const orderTotal = computed(() => {
  const subtotal = course.value.price - discountAmount.value
  return subtotal + vatAmount.value + processingFee.value
})

// Formattage
const formattedDate = computed(() => {
  return orderDate.value.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const formattedTime = computed(() => {
  return orderDate.value.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(price)
}

// Confetti animation
const confettiStyle = (index) => {
  const colors = ['#667eea', '#764ba2', '#f56565', '#ed8936', '#48bb78', '#38b2ac']
  const angle = (index * 30) + Math.random() * 15
  const delay = index * 0.1
  const color = colors[Math.floor(Math.random() * colors.length)]

  return {
    '--angle': `${angle}deg`,
    '--delay': `${delay}s`,
    'background-color': color
  }
}

// Méthodes
const copyOrderNumber = async () => {
  try {
    await navigator.clipboard.writeText(orderNumber.value)
    alert('Numéro de commande copié !')
  } catch (err) {
    console.error('Erreur de copie:', err)
  }
}

const downloadInvoice = () => {
  // Simuler le téléchargement d'une facture
  const invoiceData = {
    orderNumber: orderNumber.value,
    date: orderDate.value.toISOString(),
    customer: customerInfo.value,
    course: course.value,
    amount: orderTotal.value,
    vat: vatAmount.value
  }

  const blob = new Blob([JSON.stringify(invoiceData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `facture-${orderNumber.value}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  alert('Facture téléchargée !')
}

const resendConfirmation = async () => {
  // Simuler l'envoi d'email
  await new Promise(resolve => setTimeout(resolve, 1000))
  alert('Email de confirmation renvoyé !')
}

const printReceipt = () => {
  window.print()
}

const sharePurchase = () => {
  if (navigator.share) {
    navigator.share({
      title: `J'ai acheté le cours "${course.value.title}" sur EDUCOURS`,
      text: `Je viens de commencer le cours "${course.value.title}" sur EDUCOURS !`,
      url: window.location.origin + '/courses/' + course.value.id
    })
  } else {
    // Fallback pour les navigateurs sans support de l'API Share
    navigator.clipboard.writeText(
        `J'ai acheté le cours "${course.value.title}" sur EDUCOURS ! ${window.location.origin}/courses/${course.value.id}`
    )
    alert('Lien copié dans le presse-papier !')
  }
}

// Initialisation
onMounted(() => {
  // Charger les détails de la commande depuis le store ou l'API
  if (paymentStore.lastPayment) {
    orderNumber.value = paymentStore.lastPayment.orderNumber
    orderDate.value = new Date(paymentStore.lastPayment.timestamp)
    course.value = paymentStore.lastPayment.course
    customerInfo.value = paymentStore.lastPayment.customerInfo
    paymentMethod.value = paymentStore.lastPayment.paymentMethod
  }

  // Ajouter l'animation de confetti après le chargement
  setTimeout(() => {
    document.querySelector('.confetti').classList.add('animate')
  }, 500)

  // Suivi analytique
  trackPurchase()
})

const trackPurchase = () => {
  // Ici vous pourriez intégrer Google Analytics, Facebook Pixel, etc.
  console.log('Purchase tracked:', {
    orderNumber: orderNumber.value,
    amount: orderTotal.value,
    course: course.value.title
  })
}
</script>

<style scoped>
.payment-success-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 3rem 0;
}

.success-container {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 3rem;
}

.success-animation {
  position: relative;
  height: 200px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.checkmark-animation {
  position: relative;
  width: 100px;
  height: 100px;
  animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
  }
  70% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.checkmark-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.4);
  }
  50% {
    box-shadow: 0 0 0 20px rgba(72, 187, 120, 0);
  }
}

.checkmark-stem {
  width: 40px;
  height: 8px;
  background: white;
  position: absolute;
  transform: rotate(45deg);
  left: 20px;
  top: 45px;
  animation: drawStem 0.5s ease-out forwards;
  opacity: 0;
  animation-delay: 0.3s;
}

.checkmark-kick {
  width: 20px;
  height: 8px;
  background: white;
  position: absolute;
  transform: rotate(-45deg);
  left: 40px;
  top: 53px;
  animation: drawKick 0.5s ease-out forwards;
  opacity: 0;
  animation-delay: 0.6s;
}

@keyframes drawStem {
  0% {
    width: 0;
    opacity: 1;
  }
  100% {
    width: 40px;
    opacity: 1;
  }
}

@keyframes drawKick {
  0% {
    width: 0;
    opacity: 1;
  }
  100% {
    width: 20px;
    opacity: 1;
  }
}

.confetti {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
}

.confetti.animate {
  opacity: 1;
}

.confetti-piece {
  position: absolute;
  width: 10px;
  height: 30px;
  background: #667eea;
  top: 0;
  left: 50%;
  opacity: 0;
}

.confetti.animate .confetti-piece {
  animation: confettiFall 1s ease-out forwards;
  animation-delay: var(--delay);
}

@keyframes confettiFall {
  0% {
    transform: translate3d(0, 0, 0) rotateZ(0deg) rotateY(var(--angle));
    opacity: 1;
  }
  100% {
    transform: translate3d(var(--angle, 0), 700px, 0) rotateZ(720deg) rotateY(var(--angle));
    opacity: 0;
  }
}

.success-message {
  text-align: center;
  margin-bottom: 3rem;
}

.success-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.success-title i {
  color: #48bb78;
  font-size: 2.5rem;
}

.success-subtitle {
  font-size: 1.25rem;
  color: #718096;
  max-width: 600px;
  margin: 0 auto 2rem;
  line-height: 1.6;
}

.order-number {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f7fafc;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  font-size: 1.1rem;
}

.order-number strong {
  color: #2d3748;
  font-weight: 700;
}

.btn-copy {
  background: #edf2f7;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #4a5568;
}

.btn-copy:hover {
  background: #e2e8f0;
  color: #2d3748;
}

.order-summary {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.summary-header h2 {
  font-size: 1.75rem;
  color: #2d3748;
  margin: 0;
}

.order-date {
  color: #718096;
  font-weight: 500;
}

.summary-item {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.item-header h3 {
  font-size: 1.25rem;
  color: #2d3748;
  margin: 0;
}

.item-status {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.item-status.paid {
  background: #d4edda;
  color: #155724;
}

.course-details {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.course-thumbnail {
  width: 120px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.course-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-info {
  flex: 1;
}

.course-info h4 {
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
  color: #2d3748;
}

.course-description {
  color: #718096;
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.course-meta {
  display: flex;
  gap: 1.5rem;
  color: #718096;
  font-size: 0.875rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.course-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  min-width: 120px;
  text-align: right;
}

.payment-details {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.payment-details h3 {
  font-size: 1.25rem;
  color: #2d3748;
  margin: 0 0 1.5rem 0;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}

.detail-item {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-label {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-weight: 500;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-value.total {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
}

.detail-value.status {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.detail-value.status.success {
  background: #d4edda;
  color: #155724;
}

.customer-details {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.customer-details h3 {
  font-size: 1.25rem;
  color: #2d3748;
  margin: 0 0 1.5rem 0;
}

.customer-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 768px) {
  .customer-grid {
    grid-template-columns: 1fr;
  }
}

.customer-item {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.customer-label {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.25rem;
}

.customer-value {
  font-weight: 500;
  color: #2d3748;
}

.financial-details {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
}

.financial-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #e9ecef;
  color: #718096;
}

.financial-item:last-child {
  border-bottom: none;
}

.financial-item.total {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  padding-top: 1.5rem;
  border-top: 2px solid #e9ecef;
}

.financial-item .discount {
  color: #48bb78;
}

.next-steps {
  margin-bottom: 3rem;
}

.next-steps h2 {
  text-align: center;
  font-size: 1.75rem;
  color: #2d3748;
  margin-bottom: 2rem;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .steps-grid {
    grid-template-columns: 1fr;
  }
}

.step-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.step-card:hover {
  border-color: #667eea;
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.1);
}

.step-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.step-icon i {
  font-size: 2rem;
  color: #667eea;
}

.step-card h4 {
  font-size: 1.25rem;
  color: #2d3748;
  margin: 0 0 1rem 0;
}

.step-card p {
  color: #718096;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.btn-step {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-step:hover {
  background: #5a67d8;
  transform: translateY(-2px);
}

.guarantees-section {
  margin-bottom: 3rem;
}

.guarantees-section h2 {
  text-align: center;
  font-size: 1.75rem;
  color: #2d3748;
  margin-bottom: 2rem;
}

.guarantees-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .guarantees-grid {
    grid-template-columns: 1fr;
  }
}

.guarantee-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.guarantee-card i {
  font-size: 2rem;
  color: #667eea;
  flex-shrink: 0;
}

.guarantee-content h4 {
  font-size: 1.1rem;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.guarantee-content p {
  color: #718096;
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.success-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 0;
  border-top: 2px solid #e9ecef;
  border-bottom: 2px solid #e9ecef;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 1rem;
}

@media (max-width: 768px) {
  .success-actions {
    flex-direction: column;
    align-items: stretch;
  }
}

.actions-left,
.actions-right {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .actions-left,
  .actions-right {
    justify-content: center;
  }
}

.btn-primary,
.btn-secondary {
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: white;
  color: #495057;
  border: 2px solid #e9ecef;
}

.btn-secondary:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
}

.additional-info {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 2rem;
}

.info-card h3 {
  font-size: 1.25rem;
  color: #2d3748;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.info-card h3 i {
  color: #667eea;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-list li {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem 0;
  color: #4a5568;
}

.info-list li i {
  color: #48bb78;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

/* Styles d'impression */
@media print {
  .payment-success-view {
    background: white;
    padding: 0;
  }

  .success-container {
    box-shadow: none;
    padding: 0;
  }

  .success-animation,
  .next-steps,
  .guarantees-section,
  .success-actions,
  .additional-info,
  .btn-copy,
  .btn-step {
    display: none !important;
  }

  .order-summary {
    break-inside: avoid;
  }
}
</style>