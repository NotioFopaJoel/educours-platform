<template>
  <div class="payment-checkout">
    <div class="payment-summary">
      <h4>Résumé de la commande</h4>
      <div class="summary-item">
        <span>{{ course.title }}</span>
        <span>{{ formatPrice(course.price) }}</span>
      </div>
      <div class="summary-item" v-if="course.discount">
        <span>Réduction ({{ course.discount }}%)</span>
        <span class="discount">-{{ formatPrice(discountAmount) }}</span>
      </div>
      <div class="summary-total">
        <strong>Total</strong>
        <strong>{{ formatPrice(finalAmount) }}</strong>
      </div>
    </div>

    <div class="payment-methods">
      <h4>Moyen de paiement</h4>
      <div class="methods-grid">
        <button 
          v-for="method in paymentMethods" 
          :key="method.id"
          class="method-btn"
          :class="{ active: selectedMethod === method.id }"
          @click="selectedMethod = method.id"
        >
          <i :class="method.icon"></i>
          <span>{{ method.name }}</span>
        </button>
      </div>
    </div>

    <div class="payment-form" v-if="selectedMethod === 'card'">
      <div class="form-group">
        <label>Numéro de carte</label>
        <input type="text" placeholder="1234 5678 9012 3456" v-model="card.number">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Date d'expiration</label>
          <input type="text" placeholder="MM/YY" v-model="card.expiry">
        </div>
        <div class="form-group">
          <label>CVV</label>
          <input type="text" placeholder="123" v-model="card.cvv">
        </div>
      </div>
    </div>

    <div class="payment-actions">
      <button class="btn-cancel" @click="$emit('cancel')">Annuler</button>
      <button class="btn-pay" @click="processPayment" :disabled="isProcessing">
        <i v-if="isProcessing" class="fas fa-spinner fa-spin"></i>
        {{ isProcessing ? 'Traitement...' : `Payer ${formatPrice(finalAmount)}` }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  course: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['payment-completed', 'cancel'])

const selectedMethod = ref('card')
const isProcessing = ref(false)

const card = ref({
  number: '',
  expiry: '',
  cvv: ''
})

const paymentMethods = [
  { id: 'card', name: 'Carte bancaire', icon: 'fas fa-credit-card' },
  { id: 'orange', name: 'Orange Money', icon: 'fas fa-mobile-alt' },
  { id: 'mtn', name: 'MTN Mobile', icon: 'fas fa-mobile-alt' }
]

const discountAmount = computed(() => {
  if (!props.course.discount) return 0
  return (props.course.price * props.course.discount) / 100
})

const finalAmount = computed(() => {
  return props.course.price - discountAmount.value
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const processPayment = async () => {
  isProcessing.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    emit('payment-completed', {
      success: true,
      transactionId: 'TXN_' + Date.now(),
      amount: finalAmount.value,
      course: props.course
    })
  } catch (error) {
    console.error('Payment error:', error)
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
.payment-checkout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.payment-summary {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  padding-top: 0.75rem;
  margin-top: 0.5rem;
  font-size: 1.1rem;
}

.discount {
  color: #10b981;
}

.methods-grid {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.method-btn {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.method-btn.active {
  border-color: #4f46e5;
  background: #f5f3ff;
  color: #4f46e5;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.payment-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
}

.btn-pay {
  padding: 0.75rem 1.5rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.btn-pay:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>