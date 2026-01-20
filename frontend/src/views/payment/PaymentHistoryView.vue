<template>
  <BaseLayout>
    <template #header>
      <div class="payment-history-header">
        <div class="header-content">
          <h1>Historique des paiements</h1>
          <p>Consultez l'historique de toutes vos transactions</p>
        </div>
        <div class="header-actions">
          <div class="header-stats">
            <div class="stat-item">
              <span class="stat-label">Total dépensé</span>
              <span class="stat-value">{{ formatPrice(totalSpent) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Cours achetés</span>
              <span class="stat-value">{{ totalPurchases }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class="payment-history-view">
      <div class="container">
        <div class="history-content">
          <!-- Filtres et recherche -->
          <div class="filters-section">
            <div class="search-box">
              <i class="icon-search"></i>
              <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Rechercher par cours, numéro de commande..."
                  class="search-input"
              >
            </div>

            <div class="filter-controls">
              <div class="filter-group">
                <label>Période</label>
                <select v-model="selectedPeriod" class="form-select">
                  <option value="all">Toutes les périodes</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="year">Cette année</option>
                  <option value="custom">Personnalisée</option>
                </select>
              </div>

              <div class="filter-group" v-if="selectedPeriod === 'custom'">
                <label>Du</label>
                <input type="date" v-model="dateFrom" class="form-input">
              </div>

              <div class="filter-group" v-if="selectedPeriod === 'custom'">
                <label>Au</label>
                <input type="date" v-model="dateTo" class="form-input">
              </div>

              <div class="filter-group">
                <label>Statut</label>
                <select v-model="selectedStatus" class="form-select">
                  <option value="all">Tous les statuts</option>
                  <option value="completed">Complétés</option>
                  <option value="pending">En attente</option>
                  <option value="failed">Échoués</option>
                  <option value="refunded">Remboursés</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Méthode</label>
                <select v-model="selectedMethod" class="form-select">
                  <option value="all">Toutes les méthodes</option>
                  <option value="credit_card">Carte bancaire</option>
                  <option value="paypal">PayPal</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Virement bancaire</option>
                </select>
              </div>

              <button class="btn-apply-filters" @click="applyFilters">
                <i class="icon-filter"></i>
                Appliquer
              </button>

              <button class="btn-reset" @click="resetFilters">
                <i class="icon-refresh"></i>
                Réinitialiser
              </button>
            </div>
          </div>

          <!-- Vue d'ensemble -->
          <div class="overview-section">
            <div class="overview-card">
              <div class="overview-header">
                <h3>Vue d'ensemble</h3>
                <router-link to="/payment/reports" class="btn-export">
                  <i class="icon-download"></i>
                  Exporter
                </router-link>
              </div>

              <div class="overview-stats">
                <div class="stat-card">
                  <div class="stat-icon success">
                    <i class="icon-check-circle"></i>
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">{{ completedCount }}</div>
                    <div class="stat-label">Paiements réussis</div>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon pending">
                    <i class="icon-clock"></i>
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">{{ pendingCount }}</div>
                    <div class="stat-label">En attente</div>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon failed">
                    <i class="icon-x-circle"></i>
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">{{ failedCount }}</div>
                    <div class="stat-label">Échoués</div>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon refunded">
                    <i class="icon-refresh-ccw"></i>
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">{{ refundedCount }}</div>
                    <div class="stat-label">Remboursés</div>
                  </div>
                </div>
              </div>

              <div class="overview-chart">
                <div class="chart-header">
                  <h4>Dépenses mensuelles</h4>
                  <select v-model="chartPeriod" class="chart-select">
                    <option value="6m">6 derniers mois</option>
                    <option value="1y">Cette année</option>
                    <option value="all">Tout l'historique</option>
                  </select>
                </div>
                <div class="chart-container">
                  <canvas ref="chartCanvas"></canvas>
                </div>
              </div>
            </div>
          </div>

          <!-- Liste des transactions -->
          <div class="transactions-section">
            <div class="section-header">
              <h2>Transactions</h2>
              <div class="section-actions">
                <div class="pagination-info">
                  Affichage {{ startIndex + 1 }}-{{ endIndex }} sur {{ filteredPayments.length }}
                </div>
                <select v-model="itemsPerPage" class="form-select small">
                  <option value="10">10 par page</option>
                  <option value="25">25 par page</option>
                  <option value="50">50 par page</option>
                  <option value="100">100 par page</option>
                </select>
              </div>
            </div>

            <div class="transactions-table">
              <div class="table-responsive">
                <table class="payments-table">
                  <thead>
                  <tr>
                    <th @click="sortBy('date')" class="sortable">
                      Date
                      <i :class="sortIcon('date')"></i>
                    </th>
                    <th @click="sortBy('orderNumber')" class="sortable">
                      Commande
                      <i :class="sortIcon('orderNumber')"></i>
                    </th>
                    <th>Cours</th>
                    <th @click="sortBy('amount')" class="sortable">
                      Montant
                      <i :class="sortIcon('amount')"></i>
                    </th>
                    <th>Méthode</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="payment in paginatedPayments" :key="payment.id">
                    <td class="date-cell">
                      <div class="date-wrapper">
                        <div class="date-day">{{ formatDay(payment.date) }}</div>
                        <div class="date-details">
                          <div class="date-month">{{ formatMonth(payment.date) }}</div>
                          <div class="date-year">{{ formatYear(payment.date) }}</div>
                        </div>
                      </div>
                    </td>

                    <td class="order-cell">
                      <div class="order-number">{{ payment.orderNumber }}</div>
                      <div class="order-time">{{ formatTime(payment.date) }}</div>
                    </td>

                    <td class="course-cell">
                      <div class="course-info">
                        <div class="course-thumbnail">
                          <img :src="payment.course.thumbnail" :alt="payment.course.title">
                        </div>
                        <div class="course-details">
                          <div class="course-title">{{ payment.course.title }}</div>
                          <div class="course-instructor">{{ payment.course.instructor }}</div>
                        </div>
                      </div>
                    </td>

                    <td class="amount-cell">
                      <div class="amount">{{ formatPrice(payment.amount) }}</div>
                      <div class="amount-details" v-if="payment.discount > 0">
                        <span class="discount">-{{ formatPrice(payment.discount) }}</span>
                      </div>
                    </td>

                    <td class="method-cell">
                      <div class="method-info">
                        <div class="method-icon">
                          <i :class="payment.method.icon"></i>
                        </div>
                        <div class="method-details">
                          <div class="method-name">{{ payment.method.name }}</div>
                          <div class="method-ref" v-if="payment.method.reference">
                            {{ payment.method.reference }}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td class="status-cell">
                        <span :class="['status-badge', payment.status]">
                          {{ statusLabels[payment.status] }}
                        </span>
                    </td>

                    <td class="actions-cell">
                      <div class="action-buttons">
                        <button
                            class="btn-action view"
                            @click="viewDetails(payment)"
                            title="Voir les détails"
                        >
                          <i class="icon-eye"></i>
                        </button>
                        <button
                            class="btn-action invoice"
                            @click="downloadInvoice(payment)"
                            title="Télécharger la facture"
                        >
                          <i class="icon-download"></i>
                        </button>
                        <button
                            v-if="payment.status === 'completed'"
                            class="btn-action receipt"
                            @click="getReceipt(payment)"
                            title="Voir le reçu"
                        >
                          <i class="icon-file-text"></i>
                        </button>
                        <button
                            v-if="payment.status === 'completed' && !payment.refunded"
                            class="btn-action refund"
                            @click="requestRefund(payment)"
                            title="Demander un remboursement"
                        >
                          <i class="icon-refresh-ccw"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>

              <!-- Aucun résultat -->
              <div v-if="filteredPayments.length === 0" class="empty-state">
                <div class="empty-icon">
                  <i class="icon-file"></i>
                </div>
                <h3>Aucune transaction trouvée</h3>
                <p>Aucune transaction ne correspond à vos critères de recherche.</p>
                <button class="btn-primary" @click="resetFilters">
                  <i class="icon-refresh"></i>
                  Réinitialiser les filtres
                </button>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="filteredPayments.length > 0" class="pagination">
              <button
                  class="pagination-btn"
                  @click="previousPage"
                  :disabled="currentPage === 1"
              >
                <i class="icon-chevron-left"></i>
                Précédent
              </button>

              <div class="pagination-pages">
                <button
                    v-for="page in visiblePages"
                    :key="page"
                    class="page-number"
                    :class="{ active: page === currentPage }"
                    @click="goToPage(page)"
                >
                  {{ page }}
                </button>
                <span v-if="showEllipsis">...</span>
              </div>

              <button
                  class="pagination-btn"
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
              >
                Suivant
                <i class="icon-chevron-right"></i>
              </button>
            </div>
          </div>

          <!-- Statistiques détaillées -->
          <div class="stats-section">
            <div class="stats-card">
              <h3>Répartition par méthode de paiement</h3>
              <div class="payment-methods-stats">
                <div
                    v-for="method in methodStats"
                    :key="method.name"
                    class="method-stat"
                >
                  <div class="method-header">
                    <div class="method-icon">
                      <i :class="method.icon"></i>
                      <span class="method-name">{{ method.name }}</span>
                    </div>
                    <span class="method-percentage">{{ method.percentage }}%</span>
                  </div>
                  <div class="progress-bar">
                    <div
                        class="progress-fill"
                        :style="{ width: method.percentage + '%', backgroundColor: method.color }"
                    ></div>
                  </div>
                  <div class="method-details">
                    <span>{{ method.count }} transactions</span>
                    <span>{{ formatPrice(method.amount) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="stats-card">
              <h3>Activité récente</h3>
              <div class="recent-activity">
                <div
                    v-for="activity in recentActivity"
                    :key="activity.id"
                    class="activity-item"
                >
                  <div class="activity-icon" :class="activity.type">
                    <i :class="activity.icon"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-text">{{ activity.text }}</div>
                    <div class="activity-time">{{ activity.time }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de détails -->
    <BaseModal
        v-if="selectedPayment"
        @close="selectedPayment = null"
        :title="`Détails de la commande ${selectedPayment.orderNumber}`"
        size="large"
    >
      <PaymentDetails :payment="selectedPayment" />
    </BaseModal>

    <!-- Modal de remboursement -->
    <BaseModal
        v-if="refundPayment"
        @close="refundPayment = null"
        title="Demander un remboursement"
        danger
    >
      <RefundRequest
          :payment="refundPayment"
          @submit="processRefundRequest"
          @cancel="refundPayment = null"
      />
    </BaseModal>
  </BaseLayout>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import BaseLayout from '@/views/dashboard/BaseLayout.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import PaymentDetails from '@/components/payment/PaymentDetails.vue'
import RefundRequest from '@/components/payment/RefundRequest.vue'
import { usePaymentStore } from '@/stores/payments'

Chart.register(...registerables)

const paymentStore = usePaymentStore()

// Données de test
const payments = ref([
  {
    id: '1',
    orderNumber: 'EDC20240215001',
    date: new Date('2024-02-15T10:30:00'),
    course: {
      title: 'JavaScript Avancé - Formation Complète',
      instructor: 'Dr. Jean Dupont',
      thumbnail: '/images/course1.jpg'
    },
    amount: 199.99,
    discount: 29.99,
    method: {
      name: 'Carte bancaire',
      icon: 'icon-credit-card',
      reference: '**** 4242'
    },
    status: 'completed'
  },
  {
    id: '2',
    orderNumber: 'EDC20240214001',
    date: new Date('2024-02-14T14:20:00'),
    course: {
      title: 'React Native - Applications Mobile',
      instructor: 'Sarah Martin',
      thumbnail: '/images/course2.jpg'
    },
    amount: 149.99,
    discount: 0,
    method: {
      name: 'PayPal',
      icon: 'icon-paypal',
      reference: 'user@example.com'
    },
    status: 'completed'
  },
  {
    id: '3',
    orderNumber: 'EDC20240213001',
    date: new Date('2024-02-13T09:15:00'),
    course: {
      title: 'Machine Learning avec Python',
      instructor: 'Prof. Ahmed Benali',
      thumbnail: '/images/course3.jpg'
    },
    amount: 249.99,
    discount: 50.00,
    method: {
      name: 'Mobile Money',
      icon: 'icon-mobile',
      reference: '+225 07 00 00 00 00'
    },
    status: 'pending'
  },
  {
    id: '4',
    orderNumber: 'EDC20240212001',
    date: new Date('2024-02-12T16:45:00'),
    course: {
      title: 'Design UX/UI Avancé',
      instructor: 'Marie Dubois',
      thumbnail: '/images/course4.jpg'
    },
    amount: 179.99,
    discount: 0,
    method: {
      name: 'Virement bancaire',
      icon: 'icon-bank',
      reference: 'BIC: SOGEFRPP'
    },
    status: 'failed'
  },
  {
    id: '5',
    orderNumber: 'EDC20240211001',
    date: new Date('2024-02-11T11:00:00'),
    course: {
      title: 'Cybersécurité Fondamentale',
      instructor: 'Thomas Schmidt',
      thumbnail: '/images/course5.jpg'
    },
    amount: 299.99,
    discount: 75.00,
    method: {
      name: 'Carte bancaire',
      icon: 'icon-credit-card',
      reference: '**** 1234'
    },
    status: 'refunded'
  }
])

// Filtres
const searchQuery = ref('')
const selectedPeriod = ref('all')
const selectedStatus = ref('all')
const selectedMethod = ref('all')
const dateFrom = ref('')
const dateTo = ref('')
const sortField = ref('date')
const sortDirection = ref('desc')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Modals
const selectedPayment = ref(null)
const refundPayment = ref(null)

// Chart
const chartCanvas = ref(null)
const chartPeriod = ref('6m')
let chartInstance = null

// Labels de statut
const statusLabels = {
  completed: 'Complété',
  pending: 'En attente',
  failed: 'Échoué',
  refunded: 'Remboursé'
}

// Calculs
const filteredPayments = computed(() => {
  let filtered = [...payments.value]

  // Recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(payment =>
        payment.course.title.toLowerCase().includes(query) ||
        payment.orderNumber.toLowerCase().includes(query) ||
        payment.method.name.toLowerCase().includes(query)
    )
  }

  // Filtre par période
  if (selectedPeriod.value !== 'all') {
    const now = new Date()
    const startDate = new Date()

    switch (selectedPeriod.value) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'custom':
        if (dateFrom.value) {
          const from = new Date(dateFrom.value)
          from.setHours(0, 0, 0, 0)
          filtered = filtered.filter(p => p.date >= from)
        }
        if (dateTo.value) {
          const to = new Date(dateTo.value)
          to.setHours(23, 59, 59, 999)
          filtered = filtered.filter(p => p.date <= to)
        }
        break
    }

    if (selectedPeriod.value !== 'custom') {
      filtered = filtered.filter(p => p.date >= startDate)
    }
  }

  // Filtre par statut
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(p => p.status === selectedStatus.value)
  }

  // Filtre par méthode
  if (selectedMethod.value !== 'all') {
    filtered = filtered.filter(p => p.method.name.toLowerCase().includes(selectedMethod.value))
  }

  // Tri
  filtered.sort((a, b) => {
    let aVal = a[sortField.value]
    let bVal = b[sortField.value]

    if (sortField.value === 'date') {
      aVal = a.date.getTime()
      bVal = b.date.getTime()
    }

    if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })

  return filtered
})

const paginatedPayments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredPayments.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredPayments.value.length / itemsPerPage.value)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + itemsPerPage.value, filteredPayments.value.length)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5

  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    let start = Math.max(1, currentPage.value - 2)
    let end = Math.min(totalPages.value, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = end - maxVisible + 1
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }

  return pages
})

const showEllipsis = computed(() => {
  return totalPages.value > 5 && currentPage.value < totalPages.value - 2
})

// Statistiques
const totalSpent = computed(() => {
  return payments.value
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount - (p.discount || 0)), 0)
})

const totalPurchases = computed(() => {
  return payments.value.filter(p => p.status === 'completed').length
})

const completedCount = computed(() => {
  return payments.value.filter(p => p.status === 'completed').length
})

const pendingCount = computed(() => {
  return payments.value.filter(p => p.status === 'pending').length
})

const failedCount = computed(() => {
  return payments.value.filter(p => p.status === 'failed').length
})

const refundedCount = computed(() => {
  return payments.value.filter(p => p.status === 'refunded').length
})

const methodStats = computed(() => {
  const stats = {}

  payments.value.forEach(payment => {
    const method = payment.method.name
    if (!stats[method]) {
      stats[method] = {
        name: method,
        icon: payment.method.icon,
        count: 0,
        amount: 0,
        color: getMethodColor(method)
      }
    }
    stats[method].count++
    stats[method].amount += payment.amount
  })

  const total = payments.value.length
  const result = Object.values(stats).map(stat => ({
    ...stat,
    percentage: Math.round((stat.count / total) * 100)
  }))

  return result.sort((a, b) => b.amount - a.amount)
})

const recentActivity = computed(() => {
  return [
    {
      id: 1,
      type: 'purchase',
      icon: 'icon-shopping-cart',
      text: 'Achat du cours "JavaScript Avancé"',
      time: 'Il y a 2 heures'
    },
    {
      id: 2,
      type: 'refund',
      icon: 'icon-refresh-ccw',
      text: 'Remboursement pour "Design UX/UI"',
      time: 'Il y a 1 jour'
    },
    {
      id: 3,
      type: 'invoice',
      icon: 'icon-file-text',
      text: 'Facture générée pour la commande EDC20240214001',
      time: 'Il y a 2 jours'
    }
  ]
})

// Méthodes utilitaires
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(price)
}

const formatDay = (date) => {
  return date.getDate().toString().padStart(2, '0')
}

const formatMonth = (date) => {
  return date.toLocaleDateString('fr-FR', { month: 'short' })
}

const formatYear = (date) => {
  return date.getFullYear()
}

const formatTime = (date) => {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'desc'
  }
}

const sortIcon = (field) => {
  if (sortField.value !== field) return 'icon-chevron-up'
  return sortDirection.value === 'asc' ? 'icon-chevron-up' : 'icon-chevron-down'
}

const getMethodColor = (method) => {
  const colors = {
    'Carte bancaire': '#667eea',
    'PayPal': '#003087',
    'Mobile Money': '#48bb78',
    'Virement bancaire': '#ed8936'
  }
  return colors[method] || '#718096'
}

// Pagination
const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const goToPage = (page) => {
  currentPage.value = page
}

// Actions
const applyFilters = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedPeriod.value = 'all'
  selectedStatus.value = 'all'
  selectedMethod.value = 'all'
  dateFrom.value = ''
  dateTo.value = ''
  currentPage.value = 1
}

const viewDetails = (payment) => {
  selectedPayment.value = payment
}

const downloadInvoice = async (payment) => {
  // Simuler le téléchargement
  await new Promise(resolve => setTimeout(resolve, 1000))

  const invoiceData = {
    orderNumber: payment.orderNumber,
    date: payment.date.toISOString(),
    course: payment.course,
    amount: payment.amount,
    discount: payment.discount,
    method: payment.method,
    status: payment.status
  }

  const blob = new Blob([JSON.stringify(invoiceData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `facture-${payment.orderNumber}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  alert(`Facture pour ${payment.orderNumber} téléchargée`)
}

const getReceipt = (payment) => {
  alert(`Ouverture du reçu pour ${payment.orderNumber}`)
}

const requestRefund = (payment) => {
  refundPayment.value = payment
}

const processRefundRequest = async (refundData) => {
  // Simuler la demande de remboursement
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Mettre à jour le statut du paiement
  const paymentIndex = payments.value.findIndex(p => p.id === refundPayment.value.id)
  if (paymentIndex !== -1) {
    payments.value[paymentIndex].status = 'refunded'
  }

  alert('Demande de remboursement envoyée')
  refundPayment.value = null
}

// Chart
const initChart = () => {
  if (!chartCanvas.value) return

  // Données de test pour le graphique
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  const data = months.map(() => Math.floor(Math.random() * 500) + 100)

  const ctx = chartCanvas.value.getContext('2d')

  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months.slice(0, 6), // 6 derniers mois
      datasets: [{
        label: 'Dépenses (€)',
        data: data.slice(0, 6),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            callback: value => '€' + value
          }
        },
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      }
    }
  })
}

// Watchers
watch(chartPeriod, () => {
  initChart()
})

watch([currentPage, itemsPerPage, sortField, sortDirection], () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

// Initialisation
onMounted(() => {
  // Charger les paiements depuis le store
  if (paymentStore.payments?.length) {
    payments.value = paymentStore.payments.map(p => ({
      ...p,
      date: new Date(p.date)
    }))
  }

  // Initialiser le graphique
  nextTick(() => {
    initChart()
  })
})
</script>

<style scoped>
.payment-history-view {
  padding: 2rem 0;
}

.payment-history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.header-content h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #212529;
}

.header-content p {
  color: #6c757d;
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.filters-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

.search-box {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 150px;
  flex: 1;
}

.filter-group label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #495057;
  font-size: 0.875rem;
}

.form-select,
.form-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.btn-apply-filters,
.btn-reset {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-apply-filters {
  background: #667eea;
  color: white;
}

.btn-apply-filters:hover {
  background: #5a67d8;
}

.btn-reset {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.btn-reset:hover {
  background: #e9ecef;
}

.overview-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
  margin-bottom: 1.5rem;
}

.overview-header h3 {
  margin: 0;
  color: #212529;
  font-size: 1.25rem;
}

.btn-export {
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  text-decoration: none;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-export:hover {
  background: #e9ecef;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 0 1.5rem 1.5rem;
}

@media (max-width: 992px) {
  .overview-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .overview-stats {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.success {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
}

.stat-icon.pending {
  background: rgba(246, 173, 85, 0.1);
  color: #f6ad55;
}

.stat-icon.failed {
  background: rgba(245, 101, 101, 0.1);
  color: #f56565;
}

.stat-icon.refunded {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #718096;
}

.overview-chart {
  padding: 0 1.5rem 1.5rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-header h4 {
  margin: 0;
  color: #212529;
  font-size: 1rem;
}

.chart-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.75rem;
  background: white;
}

.chart-container {
  height: 200px;
  position: relative;
}

.transactions-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
  margin-bottom: 1rem;
}

.section-header h2 {
  margin: 0;
  color: #212529;
  font-size: 1.5rem;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: #718096;
}

.form-select.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  min-width: 120px;
}

.transactions-table {
  padding: 0 1.5rem;
}

.table-responsive {
  overflow-x: auto;
}

.payments-table {
  width: 100%;
  border-collapse: collapse;
}

.payments-table thead {
  background: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
}

.payments-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #495057;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.payments-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.payments-table th.sortable:hover {
  background: #e9ecef;
}

.payments-table th i {
  margin-left: 0.5rem;
  opacity: 0.5;
}

.payments-table tbody tr {
  border-bottom: 1px solid #f8f9fa;
  transition: background 0.2s;
}

.payments-table tbody tr:hover {
  background: #f8f9fa;
}

.payments-table td {
  padding: 1rem;
  vertical-align: middle;
}

.date-cell {
  min-width: 100px;
}

.date-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.date-day {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
  min-width: 36px;
}

.date-details {
  display: flex;
  flex-direction: column;
}

.date-month {
  font-size: 0.875rem;
  color: #718096;
  text-transform: uppercase;
  font-weight: 600;
}

.date-year {
  font-size: 0.75rem;
  color: #a0aec0;
}

.order-cell {
  min-width: 150px;
}

.order-number {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.order-time {
  font-size: 0.875rem;
  color: #718096;
}

.course-cell {
  min-width: 300px;
}

.course-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.course-thumbnail {
  width: 60px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.course-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-details {
  flex: 1;
  min-width: 0;
}

.course-title {
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-instructor {
  font-size: 0.875rem;
  color: #718096;
}

.amount-cell {
  min-width: 120px;
}

.amount {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.amount-details {
  font-size: 0.875rem;
}

.amount-details .discount {
  color: #48bb78;
  font-weight: 500;
}

.method-cell {
  min-width: 150px;
}

.method-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.method-icon {
  width: 36px;
  height: 36px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  flex-shrink: 0;
}

.method-details {
  flex: 1;
  min-width: 0;
}

.method-name {
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 0.125rem;
}

.method-ref {
  font-size: 0.75rem;
  color: #718096;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-cell {
  min-width: 120px;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.completed {
  background: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.failed {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.refunded {
  background: #cce5ff;
  color: #004085;
}

.actions-cell {
  min-width: 180px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  color: #718096;
}

.btn-action:hover {
  transform: translateY(-2px);
}

.btn-action.view:hover {
  background: #e9ecef;
  color: #495057;
}

.btn-action.invoice:hover {
  background: #d4edda;
  color: #155724;
}

.btn-action.receipt:hover {
  background: #cce5ff;
  color: #004085;
}

.btn-action.refund:hover {
  background: #f8d7da;
  color: #721c24;
}

.empty-state {
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.empty-icon i {
  font-size: 2.5rem;
  color: #cbd5e0;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #2d3748;
  margin: 0 0 1rem 0;
}

.empty-state p {
  color: #718096;
  margin: 0 0 1.5rem 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
  gap: 1rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f8f9fa;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.page-number {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  color: #495057;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.page-number:hover {
  background: #f8f9fa;
}

.page-number.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.stats-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

@media (max-width: 992px) {
  .stats-section {
    grid-template-columns: 1fr;
  }
}

.stats-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

.stats-card h3 {
  margin: 0 0 1.5rem 0;
  color: #212529;
  font-size: 1.25rem;
}

.payment-methods-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.method-stat {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.method-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.method-icon {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #495057;
  font-weight: 500;
}

.method-icon i {
  font-size: 1.25rem;
}

.method-percentage {
  font-weight: 700;
  color: #2d3748;
  font-size: 1.125rem;
}

.progress-bar {
  height: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 1s ease;
}

.method-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #718096;
}

.recent-activity {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon.purchase {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
}

.activity-icon.refund {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.activity-icon.invoice {
  background: rgba(246, 173, 85, 0.1);
  color: #f6ad55;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.activity-time {
  font-size: 0.875rem;
  color: #718096;
}
</style>