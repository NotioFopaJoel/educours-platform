<template>
  <BaseLayout>
    <template #header>
      <div class="settings-header">
        <div class="header-content">
          <h1>Paramètres</h1>
          <p>Gérez vos préférences et paramètres de compte</p>
        </div>
        <div class="header-actions">
          <button
              class="btn-save-all"
              @click="saveAllSettings"
              :disabled="!hasChanges"
          >
            <i class="icon-save"></i>
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </template>

    <div class="settings-view">
      <div class="container">
        <div class="settings-content">
          <!-- Navigation latérale -->
          <div class="settings-sidebar">
            <nav class="settings-nav">
              <ul class="nav-list">
                <li
                    v-for="tab in tabs"
                    :key="tab.id"
                    :class="{ active: activeTab === tab.id }"
                    @click="activeTab = tab.id"
                >
                  <i :class="tab.icon"></i>
                  <span>{{ tab.label }}</span>
                  <span v-if="tab.badge" class="nav-badge">{{ tab.badge }}</span>
                </li>
              </ul>
            </nav>

            <!-- Vue d'ensemble -->
            <div class="settings-overview">
              <h3>Statut du compte</h3>
              <div class="status-card">
                <div class="status-item">
                  <span class="status-label">Vérification email</span>
                  <span class="status-value verified">
                    <i class="icon-check"></i>
                    Vérifié
                  </span>
                </div>
                <div class="status-item">
                  <span class="status-label">Compte actif</span>
                  <span class="status-value active">
                    <i class="icon-check"></i>
                    Actif
                  </span>
                </div>
                <div class="status-item">
                  <span class="status-label">Abonnement</span>
                  <span class="status-value premium">
                    <i class="icon-crown"></i>
                    Premium
                  </span>
                </div>
                <div class="status-item">
                  <span class="status-label">Dernière connexion</span>
                  <span class="status-value">Il y a 2h</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Contenu principal -->
          <div class="settings-main">
            <!-- Sécurité -->
            <div v-if="activeTab === 'security'" class="tab-content">
              <div class="section-card">
                <div class="section-header">
                  <h2><i class="icon-shield"></i> Sécurité du compte</h2>
                  <p>Protégez votre compte avec des paramètres de sécurité avancés</p>
                </div>

                <div class="security-items">
                  <!-- Mot de passe -->
                  <div class="security-item">
                    <div class="item-info">
                      <div class="item-header">
                        <h3>Mot de passe</h3>
                        <span class="item-status updated">
                          <i class="icon-check"></i>
                          Mis à jour il y a 30 jours
                        </span>
                      </div>
                      <p>Changez votre mot de passe régulièrement pour plus de sécurité</p>
                    </div>
                    <button
                        class="btn-action"
                        @click="showChangePassword = true"
                    >
                      <i class="icon-edit"></i>
                      Modifier
                    </button>
                  </div>

                  <!-- Authentification à deux facteurs -->
                  <div class="security-item">
                    <div class="item-info">
                      <div class="item-header">
                        <h3>Authentification à deux facteurs (2FA)</h3>
                        <span
                            :class="{
                            'item-status': true,
                            'enabled': settings.security.twoFactorEnabled,
                            'disabled': !settings.security.twoFactorEnabled
                          }"
                        >
                          <i :class="settings.security.twoFactorEnabled ? 'icon-check' : 'icon-x'"></i>
                          {{ settings.security.twoFactorEnabled ? 'Activé' : 'Désactivé' }}
                        </span>
                      </div>
                      <p>Ajoutez une couche de sécurité supplémentaire à votre compte</p>
                    </div>
                    <div class="item-actions">
                      <button
                          v-if="!settings.security.twoFactorEnabled"
                          class="btn-action primary"
                          @click="enableTwoFactor"
                      >
                        <i class="icon-shield"></i>
                        Activer
                      </button>
                      <button
                          v-else
                          class="btn-action danger"
                          @click="disableTwoFactor"
                      >
                        <i class="icon-shield-off"></i>
                        Désactiver
                      </button>
                    </div>
                  </div>

                  <!-- Sessions actives -->
                  <div class="security-item">
                    <div class="item-info">
                      <div class="item-header">
                        <h3>Sessions actives</h3>
                        <span class="item-status">
                          {{ activeSessions }} appareil(s)
                        </span>
                      </div>
                      <p>Gérez les appareils connectés à votre compte</p>
                    </div>
                    <button
                        class="btn-action"
                        @click="showSessionsModal = true"
                    >
                      <i class="icon-monitor"></i>
                      Voir
                    </button>
                  </div>

                  <!-- Connexions suspectes -->
                  <div class="security-item">
                    <div class="item-info">
                      <div class="item-header">
                        <h3>Alertes de sécurité</h3>
                        <span class="item-status">
                          {{ securityAlerts }} alerte(s)
                        </span>
                      </div>
                      <p>Soyez informé des activités suspectes sur votre compte</p>
                    </div>
                    <div class="item-actions">
                      <button
                          class="btn-action"
                          @click="showSecurityAlerts"
                      >
                        <i class="icon-bell"></i>
                        Configurer
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Paramètres de connexion -->
              <div class="section-card">
                <h3>Paramètres de connexion</h3>
                <div class="form-group">
                  <label class="checkbox-label">
                    <input
                        type="checkbox"
                        v-model="settings.security.rememberMe"
                        class="checkbox-input"
                    >
                    <span class="checkbox-custom"></span>
                    Se souvenir de moi sur cet appareil
                  </label>
                </div>
                <div class="form-group">
                  <label class="checkbox-label">
                    <input
                        type="checkbox"
                        v-model="settings.security.loginAlerts"
                        class="checkbox-input"
                    >
                    <span class="checkbox-custom"></span>
                    M'alerter par email pour les nouvelles connexions
                  </label>
                </div>
              </div>
            </div>

            <!-- Notifications -->
            <div v-else-if="activeTab === 'notifications'" class="tab-content">
              <div class="section-card">
                <div class="section-header">
                  <h2><i class="icon-bell"></i> Préférences de notifications</h2>
                  <p>Contrôlez comment et quand vous recevez des notifications</p>
                </div>

                <div class="notification-settings">
                  <!-- Email -->
                  <div class="notification-category">
                    <h3>Notifications par email</h3>
                    <div class="notification-options">
                      <div class="option-item">
                        <div class="option-info">
                          <h4>Cours et apprentissage</h4>
                          <p>Nouveaux cours, rappels de cours, progrès</p>
                        </div>
                        <div class="option-switch">
                          <label class="switch">
                            <input
                                type="checkbox"
                                v-model="settings.notifications.email.courses"
                            >
                            <span class="slider"></span>
                          </label>
                        </div>
                      </div>

                      <div class="option-item">
                        <div class="option-info">
                          <h4>Communications pédagogiques</h4>
                          <p>Messages des enseignants, commentaires, feedback</p>
                        </div>
                        <div class="option-switch">
                          <label class="switch">
                            <input
                                type="checkbox"
                                v-model="settings.notifications.email.communication"
                            >
                            <span class="slider"></span>
                          </label>
                        </div>
                      </div>

                      <div class="option-item">
                        <div class="option-info">
                          <h4>Promotions et offres</h4>
                          <p>Nouveaux cours, réductions, offres spéciales</p>
                        </div>
                        <div class="option-switch">
                          <label class="switch">
                            <input
                                type="checkbox"
                                v-model="settings.notifications.email.promotions"
                            >
                            <span class="slider"></span>
                          </label>
                        </div>
                      </div>

                      <div class="option-item">
                        <div class="option-info">
                          <h4>Actualités de la plateforme</h4>
                          <p>Nouvelles fonctionnalités, maintenance, annonces</p>
                        </div>
                        <div class="option-switch">
                          <label class="switch">
                            <input
                                type="checkbox"
                                v-model="settings.notifications.email.platform"
                            >
                            <span class="slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Push -->
                  <div class="notification-category">
                    <h3>Notifications push</h3>
                    <div class="notification-options">
                      <div class="option-item">
                        <div class="option-info">
                          <h4>Cours en direct</h4>
                          <p>Rappels de cours en direct, début de session</p>
                        </div>
                        <div class="option-switch">
                          <label class="switch">
                            <input
                                type="checkbox"
                                v-model="settings.notifications.push.liveClasses"
                            >
                            <span class="slider"></span>
                          </label>
                        </div>
                      </div>

                      <div class="option-item">
                        <div class="option-info">
                          <h4>Devoirs et évaluations</h4>
                          <p>Échéances, corrections, retours</p>
                        </div>
                        <div class="option-switch">
                          <label class="switch">
                            <input
                                type="checkbox"
                                v-model="settings.notifications.push.assignments"
                            >
                            <span class="slider"></span>
                          </label>
                        </div>
                      </div>

                      <div class="option-item">
                        <div class="option-info">
                          <h4>Messages</h4>
                          <p>Nouveaux messages, réponses</p>
                        </div>
                        <div class="option-switch">
                          <label class="switch">
                            <input
                                type="checkbox"
                                v-model="settings.notifications.push.messages"
                            >
                            <span class="slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Fréquence -->
                  <div class="notification-category">
                    <h3>Fréquence des emails</h3>
                    <div class="frequency-options">
                      <div class="frequency-option">
                        <input
                            type="radio"
                            id="frequency-realtime"
                            v-model="settings.notifications.frequency"
                            value="realtime"
                            class="frequency-input"
                        >
                        <label for="frequency-realtime" class="frequency-label">
                          <i class="icon-zap"></i>
                          <div class="frequency-info">
                            <h4>Temps réel</h4>
                            <p>Recevez chaque notification immédiatement</p>
                          </div>
                        </label>
                      </div>

                      <div class="frequency-option">
                        <input
                            type="radio"
                            id="frequency-daily"
                            v-model="settings.notifications.frequency"
                            value="daily"
                            class="frequency-input"
                        >
                        <label for="frequency-daily" class="frequency-label">
                          <i class="icon-calendar"></i>
                          <div class="frequency-info">
                            <h4>Quotidien</h4>
                            <p>Recevez un résumé quotidien</p>
                          </div>
                        </label>
                      </div>

                      <div class="frequency-option">
                        <input
                            type="radio"
                            id="frequency-weekly"
                            v-model="settings.notifications.frequency"
                            value="weekly"
                            class="frequency-input"
                        >
                        <label for="frequency-weekly" class="frequency-label">
                          <i class="icon-clock"></i>
                          <div class="frequency-info">
                            <h4>Hebdomadaire</h4>
                            <p>Recevez un résumé hebdomadaire</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Confidentialité -->
            <div v-else-if="activeTab === 'privacy'" class="tab-content">
              <div class="section-card">
                <div class="section-header">
                  <h2><i class="icon-lock"></i> Confidentialité</h2>
                  <p>Contrôlez qui peut voir vos informations et activités</p>
                </div>

                <div class="privacy-settings">
                  <!-- Visibilité du profil -->
                  <div class="privacy-category">
                    <h3>Visibilité du profil</h3>
                    <div class="privacy-options">
                      <div class="option-item">
                        <div class="option-info">
                          <h4>Profil public</h4>
                          <p>Tout le monde peut voir votre profil</p>
                        </div>
                        <div class="option-switch">
                          <label class="switch">
                            <input
                                type="checkbox"
                                v-model="settings.privacy.publicProfile"
                            >
                            <span class="slider"></span>
                          </label>
                        </div>
                      </div>

                      <div class="option-item">
                        <div class="option-info">
                          <h4>Montrer les cours suivis</h4>
                          <p>Afficher les cours que vous suivez sur votre profil</p>
                        </div>
                        <div class="option-switch">
                          <label class="switch">
                            <input
                                type="checkbox"
                                v-model="settings.privacy.showEnrolledCourses"
                            >
                            <span class="slider"></span>
                          </label>
                        </div>
                      </div>

                      <div class="option-item">
                        <div class="option-info">
                          <h4>Montrer les certifications</h4>
                          <p>Afficher les certifications obtenues</p>
                        </div>
                        <div class="option-switch">
                          <label class="switch">
                            <input
                                type="checkbox"
                                v-model="settings.privacy.showCertifications"
                            >
                            <span class="slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Activités -->
                  <div class="privacy-category">
                    <h3>Activités</h3>
                    <div class="privacy-options">
                      <div class="option-item">
                        <div class="option-info">
                          <h4>Partager l'activité d'apprentissage</h4>
                          <p>Partager votre progression avec les autres apprenants</p>
                        </div>
                        <div class="option-switch">
                          <label class="switch">
                            <input
                                type="checkbox"
                                v-model="settings.privacy.shareLearningActivity"
                            >
                            <span class="slider"></span>
                          </label>
                        </div>
                      </div>

                      <div class="option-item">
                        <div class="option-info">
                          <h4>Afficher en ligne</h4>
                          <p>Montrer quand vous êtes en ligne</p>
                        </div>
                        <div class="option-switch">
                          <label class="switch">
                            <input
                                type="checkbox"
                                v-model="settings.privacy.showOnlineStatus"
                            >
                            <span class="slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Données personnelles -->
                  <div class="privacy-category">
                    <h3>Données personnelles</h3>
                    <div class="privacy-actions">
                      <button class="btn-action" @click="downloadData">
                        <i class="icon-download"></i>
                        Télécharger mes données
                      </button>
                      <button class="btn-action danger" @click="showDeleteModal">
                        <i class="icon-trash"></i>
                        Supprimer mon compte
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Apparence -->
            <div v-else-if="activeTab === 'appearance'" class="tab-content">
              <div class="section-card">
                <div class="section-header">
                  <h2><i class="icon-palette"></i> Apparence</h2>
                  <p>Personnalisez l'apparence de la plateforme</p>
                </div>

                <div class="appearance-settings">
                  <!-- Thème -->
                  <div class="appearance-category">
                    <h3>Thème</h3>
                    <div class="theme-options">
                      <div
                          v-for="theme in themes"
                          :key="theme.id"
                          class="theme-option"
                          :class="{ active: settings.appearance.theme === theme.id }"
                          @click="settings.appearance.theme = theme.id"
                      >
                        <div class="theme-preview" :style="{ background: theme.background }">
                          <div class="theme-header" :style="{ background: theme.header }"></div>
                          <div class="theme-content" :style="{ background: theme.content }"></div>
                        </div>
                        <div class="theme-info">
                          <h4>{{ theme.name }}</h4>
                          <p>{{ theme.description }}</p>
                        </div>
                        <div class="theme-check">
                          <i class="icon-check"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Densité -->
                  <div class="appearance-category">
                    <h3>Densité d'affichage</h3>
                    <div class="density-options">
                      <div
                          v-for="density in densities"
                          :key="density.id"
                          class="density-option"
                          :class="{ active: settings.appearance.density === density.id }"
                          @click="settings.appearance.density = density.id"
                      >
                        <div class="density-preview">
                          <div class="density-line" :style="{ height: density.lineHeight }"></div>
                          <div class="density-line" :style="{ height: density.lineHeight }"></div>
                          <div class="density-line" :style="{ height: density.lineHeight }"></div>
                        </div>
                        <div class="density-info">
                          <h4>{{ density.name }}</h4>
                          <p>{{ density.description }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Police -->
                  <div class="appearance-category">
                    <h3>Police</h3>
                    <div class="font-settings">
                      <div class="font-option">
                        <label>Taille de police</label>
                        <div class="font-size-control">
                          <button
                              class="btn-font-size"
                              @click="decreaseFontSize"
                              :disabled="settings.appearance.fontSize <= 12"
                          >
                            <i class="icon-minus"></i>
                          </button>
                          <span class="font-size-value">{{ settings.appearance.fontSize }}px</span>
                          <button
                              class="btn-font-size"
                              @click="increaseFontSize"
                              :disabled="settings.appearance.fontSize >= 18"
                          >
                            <i class="icon-plus"></i>
                          </button>
                        </div>
                      </div>

                      <div class="font-option">
                        <label>Famille de police</label>
                        <select
                            v-model="settings.appearance.fontFamily"
                            class="form-select"
                        >
                          <option value="system-ui">System UI</option>
                          <option value="inter">Inter</option>
                          <option value="roboto">Roboto</option>
                          <option value="open-sans">Open Sans</option>
                          <option value="montserrat">Montserrat</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Reset -->
                  <div class="appearance-actions">
                    <button class="btn-action" @click="resetAppearance">
                      <i class="icon-refresh"></i>
                      Réinitialiser l'apparence
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Compte -->
            <div v-else-if="activeTab === 'account'" class="tab-content">
              <div class="section-card">
                <div class="section-header">
                  <h2><i class="icon-user"></i> Gestion du compte</h2>
                  <p>Paramètres avancés de votre compte</p>
                </div>

                <div class="account-settings">
                  <!-- Informations du compte -->
                  <div class="account-info">
                    <h3>Informations du compte</h3>
                    <div class="info-grid">
                      <div class="info-item">
                        <span class="info-label">ID du compte</span>
                        <span class="info-value">EDU-{{ userAccount.id }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">Date de création</span>
                        <span class="info-value">{{ formatDate(userAccount.createdAt) }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">Dernière mise à jour</span>
                        <span class="info-value">{{ formatDate(userAccount.updatedAt) }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">Type de compte</span>
                        <span class="info-value premium">{{ userAccount.type }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Abonnement -->
                  <div class="account-category">
                    <h3>Abonnement</h3>
                    <div class="subscription-info">
                      <div class="subscription-header">
                        <div class="subscription-details">
                          <h4>Premium Plan</h4>
                          <p>Accès complet à tous les cours et fonctionnalités</p>
                        </div>
                        <div class="subscription-status">
                          <span class="status-badge active">Actif</span>
                        </div>
                      </div>

                      <div class="subscription-dates">
                        <div class="date-item">
                          <span class="date-label">Début</span>
                          <span class="date-value">15 Jan 2024</span>
                        </div>
                        <div class="date-item">
                          <span class="date-label">Renouvellement</span>
                          <span class="date-value">15 Fév 2024</span>
                        </div>
                        <div class="date-item">
                          <span class="date-label">Prix</span>
                          <span class="date-value">29,99€/mois</span>
                        </div>
                      </div>

                      <div class="subscription-actions">
                        <button class="btn-action" @click="showBilling">
                          <i class="icon-credit-card"></i>
                          Gérer la facturation
                        </button>
                        <button class="btn-action danger" @click="cancelSubscription">
                          <i class="icon-x"></i>
                          Annuler l'abonnement
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Facturation -->
                  <div class="account-category">
                    <h3>Facturation</h3>
                    <div class="billing-info">
                      <div class="billing-summary">
                        <div class="summary-item">
                          <span class="summary-label">Méthode de paiement</span>
                          <span class="summary-value">
                            <i class="icon-credit-card"></i>
                            **** **** **** 4242
                          </span>
                        </div>
                        <div class="summary-item">
                          <span class="summary-label">Prochaine facture</span>
                          <span class="summary-value">15 Fév 2024 - 29,99€</span>
                        </div>
                      </div>
                      <button class="btn-action" @click="updatePaymentMethod">
                        <i class="icon-edit"></i>
                        Mettre à jour
                      </button>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="account-actions">
                    <h3>Actions du compte</h3>
                    <div class="actions-grid">
                      <button class="action-card" @click="exportData">
                        <i class="icon-download"></i>
                        <h4>Exporter mes données</h4>
                        <p>Télécharger toutes mes données</p>
                      </button>
                      <button class="action-card" @click="deactivateAccount">
                        <i class="icon-pause"></i>
                        <h4>Désactiver le compte</h4>
                        <p>Masquer temporairement mon compte</p>
                      </button>
                      <button class="action-card danger" @click="showDeleteModal">
                        <i class="icon-trash"></i>
                        <h4>Supprimer le compte</h4>
                        <p>Supprimer définitivement mon compte</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <BaseModal
        v-if="showChangePassword"
        @close="showChangePassword = false"
        title="Changer le mot de passe"
    >
      <ChangePasswordForm @success="handlePasswordChange" />
    </BaseModal>

    <BaseModal
        v-if="showSessionsModal"
        @close="showSessionsModal = false"
        title="Sessions actives"
    >
      <SessionsList @logout="handleLogoutSession" />
    </BaseModal>

    <BaseModal
        v-if="showDeleteModal"
        @close="showDeleteModal = false"
        title="Supprimer le compte"
        danger
    >
      <DeleteAccountConfirm @confirm="deleteAccount" />
    </BaseModal>
  </BaseLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseLayout from '@/views/dashboard/BaseLayout.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import ChangePasswordForm from '@/components/auth/ChangePasswordForm.vue'
import SessionsList from '@/components/profile/SessionsList.vue'
import DeleteAccountConfirm from '@/components/profile/DeleteAccountConfirm.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// États
const activeTab = ref('security')
const showChangePassword = ref(false)
const showSessionsModal = ref(false)
const showDeleteModal = ref(false)
const saving = ref(false)

// Données initiales
const initialSettings = {
  security: {
    twoFactorEnabled: true,
    rememberMe: true,
    loginAlerts: true
  },
  notifications: {
    email: {
      courses: true,
      communication: true,
      promotions: false,
      platform: true
    },
    push: {
      liveClasses: true,
      assignments: true,
      messages: true
    },
    frequency: 'realtime'
  },
  privacy: {
    publicProfile: true,
    showEnrolledCourses: true,
    showCertifications: true,
    shareLearningActivity: true,
    showOnlineStatus: true
  },
  appearance: {
    theme: 'light',
    density: 'comfortable',
    fontSize: 16,
    fontFamily: 'system-ui'
  }
}

const settings = reactive(JSON.parse(JSON.stringify(initialSettings)))

// Données utilisateur
const userAccount = ref({
  id: '123456',
  type: 'Premium',
  createdAt: '2024-01-15',
  updatedAt: '2024-02-01'
})

const activeSessions = ref(3)
const securityAlerts = ref(1)

// Navigation
const tabs = [
  { id: 'security', label: 'Sécurité', icon: 'icon-shield', badge: null },
  { id: 'notifications', label: 'Notifications', icon: 'icon-bell', badge: null },
  { id: 'privacy', label: 'Confidentialité', icon: 'icon-lock', badge: null },
  { id: 'appearance', label: 'Apparence', icon: 'icon-palette', badge: null },
  { id: 'account', label: 'Compte', icon: 'icon-user', badge: 'Premium' }
]

// Options d'apparence
const themes = ref([
  {
    id: 'light',
    name: 'Clair',
    description: 'Thème par défaut',
    background: '#ffffff',
    header: '#f8f9fa',
    content: '#ffffff'
  },
  {
    id: 'dark',
    name: 'Sombre',
    description: 'Mode nuit',
    background: '#1a1a1a',
    header: '#2d2d2d',
    content: '#1a1a1a'
  },
  {
    id: 'blue',
    name: 'Bleu',
    description: 'Thème professionnel',
    background: '#ffffff',
    header: '#667eea',
    content: '#ffffff'
  }
])

const densities = ref([
  {
    id: 'compact',
    name: 'Compact',
    description: 'Plus d\'éléments par écran',
    lineHeight: '4px'
  },
  {
    id: 'comfortable',
    name: 'Confortable',
    description: 'Espacement optimal',
    lineHeight: '8px'
  },
  {
    id: 'spacious',
    name: 'Spacieux',
    description: 'Grand espacement',
    lineHeight: '12px'
  }
])

// Calculs
const hasChanges = computed(() => {
  return JSON.stringify(settings) !== JSON.stringify(initialSettings)
})

// Méthodes
const saveAllSettings = async () => {
  saving.value = true

  try {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Sauvegarder dans localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings))

    // Appliquer les changements
    applySettings()

    // Afficher un message de succès
    alert('Paramètres enregistrés avec succès!')

    // Réinitialiser les données initiales
    Object.assign(initialSettings, JSON.parse(JSON.stringify(settings)))

  } catch (error) {
    console.error('Erreur:', error)
    alert('Une erreur est survenue')
  } finally {
    saving.value = false
  }
}

const applySettings = () => {
  // Appliquer le thème
  document.documentElement.setAttribute('data-theme', settings.appearance.theme)

  // Appliquer la densité
  document.documentElement.setAttribute('data-density', settings.appearance.density)

  // Appliquer la taille de police
  document.documentElement.style.fontSize = settings.appearance.fontSize + 'px'

  // Appliquer la police
  document.documentElement.style.fontFamily = settings.appearance.fontFamily
}

const enableTwoFactor = async () => {
  if (confirm('Voulez-vous activer l\'authentification à deux facteurs ?')) {
    // Simuler l'activation
    await new Promise(resolve => setTimeout(resolve, 1000))
    settings.security.twoFactorEnabled = true
    alert('2FA activé avec succès!')
  }
}

const disableTwoFactor = async () => {
  if (confirm('Voulez-vous désactiver l\'authentification à deux facteurs ?')) {
    // Simuler la désactivation
    await new Promise(resolve => setTimeout(resolve, 1000))
    settings.security.twoFactorEnabled = false
    alert('2FA désactivé')
  }
}

const showSecurityAlerts = () => {
  alert('Configuration des alertes de sécurité')
}

const handlePasswordChange = () => {
  showChangePassword.value = false
  alert('Mot de passe changé avec succès!')
}

const handleLogoutSession = (sessionId) => {
  console.log('Déconnexion de la session:', sessionId)
  activeSessions.value--
}

const downloadData = () => {
  alert('Téléchargement des données...')
}

const decreaseFontSize = () => {
  if (settings.appearance.fontSize > 12) {
    settings.appearance.fontSize--
  }
}

const increaseFontSize = () => {
  if (settings.appearance.fontSize < 18) {
    settings.appearance.fontSize++
  }
}

const resetAppearance = () => {
  settings.appearance = JSON.parse(JSON.stringify(initialSettings.appearance))
  applySettings()
  alert('Apparence réinitialisée')
}

const showBilling = () => {
  router.push('/payment/billing')
}

const cancelSubscription = () => {
  if (confirm('Êtes-vous sûr de vouloir annuler votre abonnement ?')) {
    alert('Abonnement annulé. Il reste actif jusqu\'à la fin de la période.')
  }
}

const updatePaymentMethod = () => {
  router.push('/payment/methods')
}

const exportData = () => {
  alert('Export des données en cours...')
}

const deactivateAccount = () => {
  if (confirm('Voulez-vous vraiment désactiver votre compte ?')) {
    alert('Compte désactivé')
  }
}

const deleteAccount = async () => {
  if (confirm('Êtes-vous ABSOLUMENT SÛR ? Cette action est irréversible !')) {
    try {
      // Simuler la suppression
      await new Promise(resolve => setTimeout(resolve, 2000))
      authStore.logout()
      router.push('/')
      alert('Compte supprimé avec succès')
    } catch (error) {
      alert('Erreur lors de la suppression')
    }
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Initialisation
onMounted(() => {
  // Charger les paramètres sauvegardés
  const savedSettings = localStorage.getItem('userSettings')
  if (savedSettings) {
    const parsed = JSON.parse(savedSettings)
    Object.assign(settings, parsed)
    Object.assign(initialSettings, JSON.parse(JSON.stringify(parsed)))
  }

  applySettings()
})
</script>

<style scoped>
.settings-view {
  padding: 2rem 0;
}

.settings-header {
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

.btn-save-all {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save-all:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.btn-save-all:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.settings-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  align-items: start;
}

.settings-sidebar {
  position: sticky;
  top: 2rem;
}

.settings-nav {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-list li {
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-list li:hover {
  background: #f8f9fa;
}

.nav-list li.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-left-color: #667eea;
  color: #667eea;
}

.nav-list li i {
  font-size: 1.25rem;
  width: 24px;
}

.nav-list li span {
  flex: 1;
  font-weight: 500;
}

.nav-badge {
  background: #ffc107;
  color: #212529;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.settings-overview {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

.settings-overview h3 {
  margin: 0 0 1rem 0;
  color: #212529;
  font-size: 1.1rem;
}

.status-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f8f9fa;
}

.status-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.status-label {
  color: #6c757d;
  font-size: 0.875rem;
}

.status-value {
  font-weight: 500;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.status-value.verified {
  color: #28a745;
}

.status-value.active {
  color: #007bff;
}

.status-value.premium {
  color: #ffc107;
}

.settings-main {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.tab-content {
  padding: 2rem;
}

.section-card {
  margin-bottom: 2rem;
}

.section-card:last-child {
  margin-bottom: 0;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #212529;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-header p {
  color: #6c757d;
  margin: 0;
}

.security-items {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.item-info {
  flex: 1;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.item-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #212529;
}

.item-status {
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.item-status.updated {
  background: #d4edda;
  color: #155724;
}

.item-status.enabled {
  background: #d4edda;
  color: #155724;
}

.item-status.disabled {
  background: #f8d7da;
  color: #721c24;
}

.item-info p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.btn-action {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  font-size: 0.875rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-action:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.btn-action.primary {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.btn-action.primary:hover {
  background: #0056b3;
  border-color: #0056b3;
}

.btn-action.danger {
  background: #dc3545;
  border-color: #dc3545;
  color: white;
}

.btn-action.danger:hover {
  background: #c82333;
  border-color: #bd2130;
}

.notification-category {
  margin-bottom: 2rem;
}

.notification-category h3 {
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: #212529;
}

.notification-options {
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #e9ecef;
  background: white;
}

.option-item:last-child {
  border-bottom: none;
}

.option-info {
  flex: 1;
}

.option-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #212529;
}

.option-info p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 26px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #28a745;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.frequency-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.frequency-option {
  position: relative;
}

.frequency-input {
  position: absolute;
  opacity: 0;
}

.frequency-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.frequency-input:checked + .frequency-label {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.frequency-label i {
  font-size: 1.5rem;
  color: #667eea;
}

.frequency-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #212529;
}

.frequency-info p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.privacy-options {
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.privacy-category {
  margin-bottom: 2rem;
}

.privacy-category h3 {
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: #212529;
}

.privacy-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.theme-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.theme-option {
  position: relative;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-option.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.theme-preview {
  width: 100%;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
  border: 1px solid #e9ecef;
}

.theme-header {
  height: 30px;
}

.theme-content {
  height: 70px;
}

.theme-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #212529;
}

.theme-info p {
  margin: 0;
  color: #6c757d;
  font-size: 0.875rem;
}

.theme-check {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 24px;
  height: 24px;
  background: #28a745;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
}

.theme-option.active .theme-check {
  opacity: 1;
}

.density-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.density-option {
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.density-option.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.density-preview {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.density-line {
  background: #adb5bd;
  border-radius: 2px;
}

.font-settings {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.font-option {
  display: flex;
  flex-direction: column;
}

.font-option label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #495057;
}

.font-size-control {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-font-size {
  width: 36px;
  height: 36px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-font-size:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.btn-font-size:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.font-size-value {
  min-width: 60px;
  text-align: center;
  font-weight: 500;
  color: #212529;
}

.appearance-actions {
  text-align: right;
}

.account-info {
  margin-bottom: 2rem;
}

.account-info h3 {
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: #212529;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-label {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.info-value {
  font-weight: 500;
  color: #212529;
}

.info-value.premium {
  color: #ffc107;
}

.subscription-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.subscription-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.subscription-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  color: #212529;
}

.subscription-details p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.875rem;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.subscription-dates {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.date-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.date-label {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.date-value {
  font-weight: 500;
  color: #212529;
}

.subscription-actions {
  display: flex;
  gap: 1rem;
}

.billing-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.billing-summary {
  display: flex;
  gap: 2rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.summary-value {
  font-weight: 500;
  color: #212529;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.action-card {
  padding: 1.5rem;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.action-card:hover {
  background: white;
  border-color: #667eea;
  transform: translateY(-2px);
}

.action-card.danger {
  border-color: #dc3545;
}

.action-card.danger:hover {
  background: #fff5f5;
}

.action-card i {
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.action-card.danger i {
  color: #dc3545;
}

.action-card h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #212529;
}

.action-card p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 1200px) {
  .theme-options,
  .density-options,
  .frequency-options,
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .settings-content {
    grid-template-columns: 1fr;
  }

  .settings-sidebar {
    position: static;
  }

  .subscription-dates {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .settings-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .btn-save-all {
    width: 100%;
    justify-content: center;
  }

  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .item-actions {
    width: 100%;
  }

  .btn-action {
    width: 100%;
    justify-content: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .billing-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .billing-summary {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 576px) {
  .theme-options,
  .density-options,
  .frequency-options,
  .actions-grid {
    grid-template-columns: 1fr;
  }

  .font-settings {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .subscription-actions {
    flex-direction: column;
  }

  .privacy-actions {
    flex-direction: column;
  }
}
</style>