<template>
  <div class="payment-checkout-view">
    <!-- En-tête -->
    <div class="checkout-header">
      <div class="container">
        <nav class="breadcrumb-nav">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <router-link to="/courses">Cours</router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link :to="`/courses/${course.id}`">{{ course.title }}</router-link>
            </li>
            <li class="breadcrumb-item active">Paiement</li>
          </ol>
        </nav>

        <div class="header-content">
          <div class="header-left">
            <h1 class="page-title">Finaliser votre achat</h1>
            <p class="page-subtitle">Sécurisé et rapide</p>
          </div>

          <div class="header-right">
            <div class="secure-badge">
              <i class="icon-lock"></i>
              <div class="secure-text">
                <span class="secure-title">Paiement 100% sécurisé</span>
                <span class="secure-subtitle">Cryptage SSL 256 bits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="checkout-main">
      <div class="container">
        <div class="checkout-content">
          <!-- Colonne gauche : Processus de paiement -->
          <div class="checkout-process">
            <!-- Étape 1 : Information -->
            <div class="checkout-step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
              <div class="step-header">
                <div class="step-number">1</div>
                <div class="step-info">
                  <h3 class="step-title">Informations personnelles</h3>
                  <p class="step-description">Renseignez vos coordonnées</p>
                </div>
              </div>

              <div class="step-content" v-if="currentStep === 1">
                <div class="form-group">
                  <label for="fullName">Nom complet</label>
                  <input
                      type="text"
                      id="fullName"
                      v-model="customerInfo.fullName"
                      placeholder="Jean Dupont"
                      class="form-input"
                      :class="{ error: errors.fullName }"
                  >
                  <span v-if="errors.fullName" class="error-message">{{ errors.fullName }}</span>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        v-model="customerInfo.email"
                        placeholder="jean@exemple.com"
                        class="form-input"
                        :class="{ error: errors.email }"
                    >
                    <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                  </div>
                  <div class="form-group">
                    <label for="phone">Téléphone</label>
                    <input
                        type="tel"
                        id="phone"
                        v-model="customerInfo.phone"
                        placeholder="+33 6 12 34 56 78"
                        class="form-input"
                        :class="{ error: errors.phone }"
                    >
                    <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
                  </div>
                </div>

                <div class="form-group">
                  <label for="address">Adresse</label>
                  <input
                      type="text"
                      id="address"
                      v-model="customerInfo.address"
                      placeholder="123 Rue de l'Exemple"
                      class="form-input"
                      :class="{ error: errors.address }"
                  >
                  <span v-if="errors.address" class="error-message">{{ errors.address }}</span>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="city">Ville</label>
                    <input
                        type="text"
                        id="city"
                        v-model="customerInfo.city"
                        placeholder="Paris"
                        class="form-input"
                        :class="{ error: errors.city }"
                    >
                    <span v-if="errors.city" class="error-message">{{ errors.city }}</span>
                  </div>
                  <div class="form-group">
                    <label for="postalCode">Code postal</label>
                    <input
                        type="text"
                        id="postalCode"
                        v-model="customerInfo.postalCode"
                        placeholder="75001"
                        class="form-input"
                        :class="{ error: errors.postalCode }"
                    >
                    <span v-if="errors.postalCode" class="error-message">{{ errors.postalCode }}</span>
                  </div>
                </div>

                <div class="form-group">
                  <label for="country">Pays</label>
                  <select
                      id="country"
                      v-model="customerInfo.country"
                      class="form-select"
                      :class="{ error: errors.country }"
                  >
                    <option value="">Sélectionnez un pays</option>
                    <option value="FR">France</option>
                    <option value="BE">Belgique</option>
                    <option value="CH">Suisse</option>
                    <option value="CA">Canada</option>
                    <option value="MA">Maroc</option>
                    <option value="SN">Sénégal</option>
                    <option value="CI">Côte d'Ivoire</option>
                  </select>
                  <span v-if="errors.country" class="error-message">{{ errors.country }}</span>
                </div>

                <div class="form-group">
                  <label class="checkbox-label">
                    <input
                        type="checkbox"
                        v-model="customerInfo.saveInfo"
                        class="checkbox-input"
                    >
                    <span class="checkbox-custom"></span>
                    Enregistrer mes informations pour les prochains achats
                  </label>
                </div>

                <div class="form-group">
                  <label class="checkbox-label">
                    <input
                        type="checkbox"
                        v-model="customerInfo.receiptByEmail"
                        class="checkbox-input"
                    >
                    <span class="checkbox-custom"></span>
                    Recevoir le reçu par email
                  </label>
                </div>

                <div class="step-actions">
                  <button class="btn-primary" @click="nextStep">
                    <i class="icon-arrow-right"></i>
                    Continuer vers le paiement
                  </button>
                </div>
              </div>
            </div>

            <!-- Étape 2 : Paiement -->
            <div class="checkout-step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
              <div class="step-header">
                <div class="step-number">2</div>
                <div class="step-info">
                  <h3 class="step-title">Méthode de paiement</h3>
                  <p class="step-description">Choisissez votre moyen de paiement</p>
                </div>
              </div>

              <div class="step-content" v-if="currentStep === 2">
                <!-- Méthodes de paiement -->
                <div class="payment-methods">
                  <div class="methods-header">
                    <h4>Choisissez votre méthode de paiement</h4>
                  </div>

                  <div class="methods-grid">
                    <div
                        v-for="method in paymentMethods"
                        :key="method.id"
                        class="method-card"
                        :class="{ active: selectedMethod === method.id }"
                        @click="selectPaymentMethod(method.id)"
                    >
                      <div class="method-icon">
                        <i :class="method.icon"></i>
                      </div>
                      <div class="method-info">
                        <h5>{{ method.name }}</h5>
                        <p>{{ method.description }}</p>
                      </div>
                      <div class="method-check">
                        <i class="icon-check"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Carte de crédit -->
                <div v-if="selectedMethod === 'credit_card'" class="credit-card-form">
                  <div class="form-group">
                    <label for="cardNumber">Numéro de carte</label>
                    <div class="input-with-icon">
                      <input
                          type="text"
                          id="cardNumber"
                          v-model="paymentInfo.cardNumber"
                          placeholder="1234 5678 9012 3456"
                          class="form-input"
                          maxlength="19"
                          @input="formatCardNumber"
                          :class="{ error: errors.cardNumber }"
                      >
                      <div class="card-icons">
                        <i class="icon-visa" v-if="cardType === 'visa'"></i>
                        <i class="icon-mastercard" v-else-if="cardType === 'mastercard'"></i>
                        <i class="icon-amex" v-else-if="cardType === 'amex'"></i>
                      </div>
                    </div>
                    <span v-if="errors.cardNumber" class="error-message">{{ errors.cardNumber }}</span>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label for="cardExpiry">Date d'expiration</label>
                      <input
                          type="text"
                          id="cardExpiry"
                          v-model="paymentInfo.cardExpiry"
                          placeholder="MM/AA"
                          class="form-input"
                          maxlength="5"
                          @input="formatExpiry"
                          :class="{ error: errors.cardExpiry }"
                      >
                      <span v-if="errors.cardExpiry" class="error-message">{{ errors.cardExpiry }}</span>
                    </div>
                    <div class="form-group">
                      <label for="cardCVC">CVC</label>
                      <div class="input-with-icon">
                        <input
                            type="password"
                            id="cardCVC"
                            v-model="paymentInfo.cardCVC"
                            placeholder="123"
                            class="form-input"
                            maxlength="4"
                            :class="{ error: errors.cardCVC }"
                        >
                        <button
                            class="btn-show-cvc"
                            @click="toggleCvcVisibility"
                            type="button"
                        >
                          <i :class="showCvc ? 'icon-eye-off' : 'icon-eye'"></i>
                        </button>
                      </div>
                      <span v-if="errors.cardCVC" class="error-message">{{ errors.cardCVC }}</span>
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="cardName">Nom sur la carte</label>
                    <input
                        type="text"
                        id="cardName"
                        v-model="paymentInfo.cardName"
                        placeholder="JEAN DUPONT"
                        class="form-input"
                        :class="{ error: errors.cardName }"
                    >
                    <span v-if="errors.cardName" class="error-message">{{ errors.cardName }}</span>
                  </div>

                  <div class="form-group">
                    <label class="checkbox-label">
                      <input
                          type="checkbox"
                          v-model="paymentInfo.saveCard"
                          class="checkbox-input"
                      >
                      <span class="checkbox-custom"></span>
                      Enregistrer cette carte pour les prochains paiements
                    </label>
                  </div>
                </div>

                <!-- PayPal -->
                <div v-if="selectedMethod === 'paypal'" class="paypal-info">
                  <div class="paypal-logo">
                    <i class="icon-paypal"></i>
                  </div>
                  <p class="paypal-description">
                    Vous serez redirigé vers PayPal pour compléter votre paiement en toute sécurité.
                  </p>
                  <div class="paypal-benefits">
                    <div class="benefit-item">
                      <i class="icon-check-circle"></i>
                      <span>Paiement rapide et sécurisé</span>
                    </div>
                    <div class="benefit-item">
                      <i class="icon-check-circle"></i>
                      <span>Aucune information bancaire partagée</span>
                    </div>
                    <div class="benefit-item">
                      <i class="icon-check-circle"></i>
                      <span>Protection des achats incluse</span>
                    </div>
                  </div>
                </div>

                <!-- Mobile Money -->
                <div v-if="selectedMethod === 'mobile_money'" class="mobile-money-form">
                  <div class="form-group">
                    <label for="mobileOperator">Opérateur mobile</label>
                    <select
                        id="mobileOperator"
                        v-model="paymentInfo.mobileOperator"
                        class="form-select"
                        :class="{ error: errors.mobileOperator }"
                    >
                      <option value="">Sélectionnez votre opérateur</option>
                      <option value="orange">Orange Money</option>
                      <option value="mtn">MTN Mobile Money</option>
                      <option value="wave">Wave</option>
                      <option value="free">Free Money</option>
                      <option value="moov">Moov Money</option>
                    </select>
                    <span v-if="errors.mobileOperator" class="error-message">{{ errors.mobileOperator }}</span>
                  </div>

                  <div class="form-group">
                    <label for="mobileNumber">Numéro mobile</label>
                    <input
                        type="tel"
                        id="mobileNumber"
                        v-model="paymentInfo.mobileNumber"
                        placeholder="+225 07 00 00 00 00"
                        class="form-input"
                        :class="{ error: errors.mobileNumber }"
                    >
                    <span v-if="errors.mobileNumber" class="error-message">{{ errors.mobileNumber }}</span>
                  </div>

                  <div class="payment-instructions">
                    <h5>Instructions :</h5>
                    <ol>
                      <li>Renseignez votre numéro mobile ci-dessus</li>
                      <li>Vous recevrez une demande de paiement sur votre téléphone</li>
                      <li>Confirmez le paiement avec votre code PIN</li>
                      <li>Attendez la confirmation (généralement instantanée)</li>
                    </ol>
                  </div>
                </div>

                <!-- Virement bancaire -->
                <div v-if="selectedMethod === 'bank_transfer'" class="bank-transfer-info">
                  <div class="bank-details">
                    <h5>Coordonnées bancaires :</h5>
                    <div class="detail-item">
                      <span class="detail-label">Banque :</span>
                      <span class="detail-value">Société Générale</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">IBAN :</span>
                      <span class="detail-value">FR76 3000 3000 3000 1234 5678 901</span>
                      <button class="btn-copy" @click="copyToClipboard('FR76 3000 3000 3000 1234 5678 901')">
                        <i class="icon-copy"></i>
                      </button>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">BIC :</span>
                      <span class="detail-value">SOGEFRPP</span>
                      <button class="btn-copy" @click="copyToClipboard('SOGEFRPP')">
                        <i class="icon-copy"></i>
                      </button>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Titulaire :</span>
                      <span class="detail-value">EDUCOURS SAS</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Référence :</span>
                      <span class="detail-value">{{ orderNumber }}</span>
                      <button class="btn-copy" @click="copyToClipboard(orderNumber)">
                        <i class="icon-copy"></i>
                      </button>
                    </div>
                  </div>

                  <div class="transfer-instructions">
                    <h5>Instructions :</h5>
                    <ul>
                      <li>Utilisez la référence de commande ci-dessus dans la communication</li>
                      <li>Votre commande sera activée après réception du virement</li>
                      <li>Délai de traitement : 24-48 heures ouvrables</li>
                      <li>Envoyez-nous le justificatif pour accélérer le traitement</li>
                    </ul>
                  </div>
                </div>

                <div class="step-actions">
                  <button class="btn-secondary" @click="previousStep">
                    <i class="icon-arrow-left"></i>
                    Retour
                  </button>
                  <button class="btn-primary" @click="nextStep" :disabled="!selectedMethod">
                    <i class="icon-lock"></i>
                    Payer {{ formatPrice(orderTotal) }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Étape 3 : Confirmation -->
            <div class="checkout-step" :class="{ active: currentStep === 3, completed: currentStep > 3 }">
              <div class="step-header">
                <div class="step-number">3</div>
                <div class="step-info">
                  <h3 class="step-title">Confirmation</h3>
                  <p class="step-description">Vérifiez et confirmez votre commande</p>
                </div>
              </div>

              <div class="step-content" v-if="currentStep === 3">
                <div class="confirmation-summary">
                  <div class="summary-header">
                    <h4>Récapitulatif de votre commande</h4>
                  </div>

                  <div class="summary-content">
                    <!-- Produit -->
                    <div class="summary-item product-summary">
                      <div class="item-thumbnail">
                        <img :src="course.thumbnail" :alt="course.title">
                      </div>
                      <div class="item-details">
                        <h5>{{ course.title }}</h5>
                        <p>{{ course.description }}</p>
                        <div class="item-meta">
                          <span class="meta-item">
                            <i class="icon-clock"></i>
                            {{ course.duration }}
                          </span>
                          <span class="meta-item">
                            <i class="icon-play"></i>
                            {{ course.lessons }} leçons
                          </span>
                          <span class="meta-item">
                            <i class="icon-certificate"></i>
                            Certificat inclus
                          </span>
                        </div>
                      </div>
                      <div class="item-price">
                        {{ formatPrice(course.price) }}
                      </div>
                    </div>

                    <!-- Informations client -->
                    <div class="summary-section">
                      <h5>Informations personnelles</h5>
                      <div class="info-grid">
                        <div class="info-item">
                          <span class="info-label">Nom :</span>
                          <span class="info-value">{{ customerInfo.fullName }}</span>
                        </div>
                        <div class="info-item">
                          <span class="info-label">Email :</span>
                          <span class="info-value">{{ customerInfo.email }}</span>
                        </div>
                        <div class="info-item">
                          <span class="info-label">Téléphone :</span>
                          <span class="info-value">{{ customerInfo.phone }}</span>
                        </div>
                        <div class="info-item">
                          <span class="info-label">Adresse :</span>
                          <span class="info-value">{{ customerInfo.address }}, {{ customerInfo.postalCode }} {{ customerInfo.city }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Méthode de paiement -->
                    <div class="summary-section">
                      <h5>Méthode de paiement</h5>
                      <div class="payment-method-display">
                        <i :class="selectedMethodDetails.icon"></i>
                        <div class="method-info">
                          <span class="method-name">{{ selectedMethodDetails.name }}</span>
                          <span class="method-description">{{ selectedMethodDetails.description }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Détails de paiement -->
                    <div class="payment-details">
                      <div class="detail-row">
                        <span>Sous-total :</span>
                        <span>{{ formatPrice(course.price) }}</span>
                      </div>
                      <div class="detail-row" v-if="discountAmount > 0">
                        <span>Réduction :</span>
                        <span class="discount">-{{ formatPrice(discountAmount) }}</span>
                      </div>
                      <div class="detail-row">
                        <span>Frais de traitement :</span>
                        <span>{{ formatPrice(processingFee) }}</span>
                      </div>
                      <div class="detail-row">
                        <span>TVA ({{ vatRate }}%) :</span>
                        <span>{{ formatPrice(vatAmount) }}</span>
                      </div>
                      <div class="detail-row total">
                        <span>Total :</span>
                        <span>{{ formatPrice(orderTotal) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Conditions -->
                <div class="terms-agreement">
                  <label class="checkbox-label">
                    <input
                        type="checkbox"
                        v-model="agreeTerms"
                        class="checkbox-input"
                        :class="{ error: !agreeTerms && showTermsError }"
                    >
                    <span class="checkbox-custom"></span>
                    <span class="terms-text">
                      Je reconnais avoir lu et j'accepte les
                      <a href="/terms" target="_blank">Conditions Générales de Vente</a>
                      et la
                      <a href="/privacy" target="_blank">Politique de Confidentialité</a>
                    </span>
                  </label>
                  <span v-if="!agreeTerms && showTermsError" class="error-message">
                    Vous devez accepter les conditions pour continuer
                  </span>
                </div>

                <div class="step-actions">
                  <button class="btn-secondary" @click="previousStep">
                    <i class="icon-arrow-left"></i>
                    Modifier
                  </button>
                  <button class="btn-primary" @click="processPayment" :disabled="processing">
                    <template v-if="processing">
                      <i class="icon-loader"></i>
                      Traitement en cours...
                    </template>
                    <template v-else>
                      <i class="icon-check"></i>
                      Confirmer et payer
                    </template>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Colonne droite : Récapitulatif -->
          <div class="checkout-summary">
            <div class="summary-card">
              <!-- Produit -->
              <div class="product-summary">
                <div class="product-header">
                  <h4>Votre commande</h4>
                  <span class="order-number">#{{ orderNumber }}</span>
                </div>

                <div class="product-item">
                  <div class="product-image">
                    <img :src="course.thumbnail" :alt="course.title">
                  </div>
                  <div class="product-details">
                    <h5>{{ course.title }}</h5>
                    <p class="product-category">{{ course.category }}</p>
                    <p class="product-instructor">
                      <i class="icon-user"></i>
                      {{ course.instructor }}
                    </p>
                  </div>
                  <div class="product-price">
                    {{ formatPrice(course.price) }}
                  </div>
                </div>
              </div>

              <!-- Promo code -->
              <div class="promo-section">
                <div class="promo-header">
                  <h5>Code promo</h5>
                  <button
                      v-if="discountCode"
                      class="btn-remove-promo"
                      @click="removePromoCode"
                  >
                    Supprimer
                  </button>
                </div>

                <div v-if="!discountCode" class="promo-input">
                  <input
                      type="text"
                      v-model="promoInput"
                      placeholder="Entrez votre code"
                      class="form-input"
                      @keyup.enter="applyPromoCode"
                  >
                  <button
                      class="btn-apply"
                      @click="applyPromoCode"
                      :disabled="!promoInput.trim()"
                  >
                    Appliquer
                  </button>
                </div>

                <div v-else class="promo-applied">
                  <div class="promo-success">
                    <i class="icon-check-circle"></i>
                    <span>{{ discountCode }} appliqué</span>
                  </div>
                  <span class="promo-discount">-{{ formatPrice(discountAmount) }}</span>
                </div>
              </div>

              <!-- Récapitulatif prix -->
              <div class="price-summary">
                <div class="price-row">
                  <span>Sous-total :</span>
                  <span>{{ formatPrice(course.price) }}</span>
                </div>
                <div class="price-row" v-if="discountAmount > 0">
                  <span>Réduction :</span>
                  <span class="discount">-{{ formatPrice(discountAmount) }}</span>
                </div>
                <div class="price-row">
                  <span>Frais de traitement :</span>
                  <span>{{ formatPrice(processingFee) }}</span>
                </div>
                <div class="price-row">
                  <span>TVA ({{ vatRate }}%) :</span>
                  <span>{{ formatPrice(vatAmount) }}</span>
                </div>
                <div class="price-row total">
                  <span>Total :</span>
                  <span>{{ formatPrice(orderTotal) }}</span>
                </div>
              </div>

              <!-- Garanties -->
              <div class="guarantees">
                <div class="guarantee-item">
                  <i class="icon-shield"></i>
                  <div class="guarantee-text">
                    <span class="guarantee-title">Garantie satisfait ou remboursé</span>
                    <span class="guarantee-desc">30 jours pour changer d'avis</span>
                  </div>
                </div>
                <div class="guarantee-item">
                  <i class="icon-lock"></i>
                  <div class="guarantee-text">
                    <span class="guarantee-title">Paiement sécurisé</span>
                    <span class="guarantee-desc">Cryptage SSL 256 bits</span>
                  </div>
                </div>
                <div class="guarantee-item">
                  <i class="icon-support"></i>
                  <div class="guarantee-text">
                    <span class="guarantee-title">Support client</span>
                    <span class="guarantee-desc">Disponible 7j/7</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Timeline de paiement -->
            <div class="payment-timeline">
              <div class="timeline-step" :class="{ active: currentStep >= 1 }">
                <div class="step-dot"></div>
                <div class="step-info">
                  <span class="step-title">Informations</span>
                  <span class="step-time">2 min</span>
                </div>
              </div>
              <div class="timeline-step" :class="{ active: currentStep >= 2 }">
                <div class="step-dot"></div>
                <div class="step-info">
                  <span class="step-title">Paiement</span>
                  <span class="step-time">1 min</span>
                </div>
              </div>
              <div class="timeline-step" :class="{ active: currentStep >= 3 }">
                <div class="step-dot"></div>
                <div class="step-info">
                  <span class="step-title">Confirmation</span>
                  <span class="step-time">30 sec</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de paiement en cours -->
    <div class="modal-overlay" v-if="showProcessingModal">
      <div class="modal modal-processing">
        <div class="modal-body">
          <div class="processing-content">
            <div class="processing-animation">
              <div class="loader"></div>
            </div>
            <h3>Paiement en cours</h3>
            <p>Veuillez ne pas fermer cette fenêtre...</p>
            <div class="processing-steps">
              <div class="processing-step" :class="{ active: processingStep >= 1 }">
                <i class="icon-check"></i>
                <span>Validation des informations</span>
              </div>
              <div class="processing-step" :class="{ active: processingStep >= 2 }">
                <i class="icon-check"></i>
                <span>Connexion au système de paiement</span>
              </div>
              <div class="processing-step" :class="{ active: processingStep >= 3 }">
                <i class="icon-check"></i>
                <span>Traitement de la transaction</span>
              </div>
              <div class="processing-step" :class="{ active: processingStep >= 4 }">
                <i class="icon-check"></i>
                <span>Confirmation</span>
              </div>
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

// États
const currentStep = ref(1)
const processing = ref(false)
const processingStep = ref(0)
const showProcessingModal = ref(false)
const selectedMethod = ref('credit_card')
const agreeTerms = ref(false)
const showTermsError = ref(false)
const promoInput = ref('')
const discountCode = ref('')
const showCvc = ref(false)

// Erreurs
const errors = ref({})

// Informations client
const customerInfo = ref({
  fullName: 'Koffi Kouamé',
  email: 'koffi@educours.com',
  phone: '+33 6 12 34 56 78',
  address: '123 Avenue des Champs-Élysées',
  city: 'Paris',
  postalCode: '75008',
  country: 'FR',
  saveInfo: true,
  receiptByEmail: true
})

// Informations de paiement
const paymentInfo = ref({
  cardNumber: '',
  cardExpiry: '',
  cardCVC: '',
  cardName: '',
  saveCard: false,
  mobileOperator: '',
  mobileNumber: ''
})

// Données du cours
const course = ref({
  id: route.params.courseId || 1,
  title: 'JavaScript Avancé - Formation Complète',
  description: 'Maîtrisez JavaScript moderne avec les dernières fonctionnalités ES6+',
  thumbnail: '/images/course1.jpg',
  category: 'Développement Web',
  instructor: 'Dr. Jean Dupont',
  duration: '25 heures',
  lessons: 42,
  price: 199.99
})

// Méthodes de paiement
const paymentMethods = ref([
  {
    id: 'credit_card',
    name: 'Carte bancaire',
    description: 'Visa, Mastercard, American Express',
    icon: 'icon-credit-card'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Paiement rapide et sécurisé',
    icon: 'icon-paypal'
  },
  {
    id: 'mobile_money',
    name: 'Mobile Money',
    description: 'Orange Money, MTN, Wave',
    icon: 'icon-mobile'
  },
  {
    id: 'bank_transfer',
    name: 'Virement bancaire',
    description: 'IBAN - Virement SEPA',
    icon: 'icon-bank'
  },
  {
    id: 'crypto',
    name: 'Cryptomonnaie',
    description: 'Bitcoin, Ethereum, USDT',
    icon: 'icon-crypto'
  }
])

// Calculs
const orderNumber = ref(`EDC${Date.now()}`)
const vatRate = ref(20)
const processingFee = ref(1.99)
const discountPercentage = ref(15)
const discountAmount = computed(() => {
  if (discountCode.value) {
    return (course.value.price * discountPercentage.value) / 100
  }
  return 0
})
const subtotal = computed(() => {
  return course.value.price - discountAmount.value
})
const vatAmount = computed(() => {
  return (subtotal.value * vatRate.value) / 100
})
const orderTotal = computed(() => {
  return subtotal.value + vatAmount.value + processingFee.value
})

// Méthodes sélectionnées
const selectedMethodDetails = computed(() => {
  return paymentMethods.value.find(m => m.id === selectedMethod.value) || paymentMethods.value[0]
})

// Type de carte
const cardType = computed(() => {
  const number = paymentInfo.value.cardNumber.replace(/\s/g, '')
  if (/^4/.test(number)) return 'visa'
  if (/^5[1-5]/.test(number)) return 'mastercard'
  if (/^3[47]/.test(number)) return 'amex'
  return 'unknown'
})

// Méthodes utilitaires
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(price)
}

const formatCardNumber = (event) => {
  let value = event.target.value.replace(/\s/g, '')
  value = value.replace(/\D/g, '')
  value = value.replace(/(\d{4})/g, '$1 ').trim()
  paymentInfo.value.cardNumber = value.slice(0, 19)
}

const formatExpiry = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2)
  }
  paymentInfo.value.cardExpiry = value.slice(0, 5)
}

const toggleCvcVisibility = () => {
  showCvc.value = !showCvc.value
  const input = document.getElementById('cardCVC')
  if (input) {
    input.type = showCvc.value ? 'text' : 'password'
  }
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('Copié dans le presse-papier !')
  } catch (err) {
    console.error('Erreur de copie :', err)
  }
}

// Validation
const validateStep1 = () => {
  const newErrors = {}

  if (!customerInfo.value.fullName?.trim()) {
    newErrors.fullName = 'Le nom complet est requis'
  }

  if (!customerInfo.value.email?.trim()) {
    newErrors.email = 'L\'email est requis'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.value.email)) {
    newErrors.email = 'Email invalide'
  }

  if (!customerInfo.value.phone?.trim()) {
    newErrors.phone = 'Le téléphone est requis'
  }

  if (!customerInfo.value.address?.trim()) {
    newErrors.address = 'L\'adresse est requise'
  }

  if (!customerInfo.value.city?.trim()) {
    newErrors.city = 'La ville est requise'
  }

  if (!customerInfo.value.postalCode?.trim()) {
    newErrors.postalCode = 'Le code postal est requis'
  }

  if (!customerInfo.value.country) {
    newErrors.country = 'Le pays est requis'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const validateStep2 = () => {
  const newErrors = {}

  if (selectedMethod.value === 'credit_card') {
    const cardNumber = paymentInfo.value.cardNumber.replace(/\s/g, '')
    if (!cardNumber) {
      newErrors.cardNumber = 'Le numéro de carte est requis'
    } else if (cardNumber.length < 13 || cardNumber.length > 19) {
      newErrors.cardNumber = 'Numéro de carte invalide'
    } else if (!/^\d+$/.test(cardNumber)) {
      newErrors.cardNumber = 'Le numéro de carte ne doit contenir que des chiffres'
    }

    if (!paymentInfo.value.cardExpiry) {
      newErrors.cardExpiry = 'La date d\'expiration est requise'
    } else {
      const [month, year] = paymentInfo.value.cardExpiry.split('/')
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear() % 100
      const currentMonth = currentDate.getMonth() + 1

      if (!month || !year || month.length !== 2 || year.length !== 2) {
        newErrors.cardExpiry = 'Format invalide (MM/AA)'
      } else if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.cardExpiry = 'Mois invalide'
      } else if (parseInt(year) < currentYear ||
          (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.cardExpiry = 'La carte a expiré'
      }
    }

    if (!paymentInfo.value.cardCVC) {
      newErrors.cardCVC = 'Le CVC est requis'
    } else if (paymentInfo.value.cardCVC.length < 3 || paymentInfo.value.cardCVC.length > 4) {
      newErrors.cardCVC = 'CVC invalide'
    } else if (!/^\d+$/.test(paymentInfo.value.cardCVC)) {
      newErrors.cardCVC = 'Le CVC ne doit contenir que des chiffres'
    }

    if (!paymentInfo.value.cardName?.trim()) {
      newErrors.cardName = 'Le nom sur la carte est requis'
    }
  }

  if (selectedMethod.value === 'mobile_money') {
    if (!paymentInfo.value.mobileOperator) {
      newErrors.mobileOperator = 'L\'opérateur est requis'
    }

    if (!paymentInfo.value.mobileNumber) {
      newErrors.mobileNumber = 'Le numéro mobile est requis'
    } else if (!/^\+?[\d\s\-]+$/.test(paymentInfo.value.mobileNumber)) {
      newErrors.mobileNumber = 'Numéro mobile invalide'
    }
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const validateStep3 = () => {
  if (!agreeTerms.value) {
    showTermsError.value = true
    return false
  }
  showTermsError.value = false
  return true
}

// Navigation entre étapes
const nextStep = async () => {
  if (currentStep.value === 1) {
    if (!validateStep1()) return
  } else if (currentStep.value === 2) {
    if (!validateStep2()) return
  } else if (currentStep.value === 3) {
    if (!validateStep3()) return
    await processPayment()
    return
  }

  currentStep.value++

  // Scroll vers le haut de l'étape
  setTimeout(() => {
    const stepElement = document.querySelector('.checkout-step.active')
    if (stepElement) {
      stepElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 100)
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--

    // Scroll vers le haut de l'étape
    setTimeout(() => {
      const stepElement = document.querySelector('.checkout-step.active')
      if (stepElement) {
        stepElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }
}

const selectPaymentMethod = (methodId) => {
  selectedMethod.value = methodId
  // Réinitialiser les erreurs
  errors.value = {}
}

// Gestion des codes promo
const applyPromoCode = async () => {
  if (!promoInput.value.trim()) return

  // Simuler une vérification API
  processing.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Pour la démo, accepter seulement certains codes
  const validCodes = ['EDUC15', 'WELCOME10', 'BACKTOSCHOOL20']
  const inputCode = promoInput.value.trim().toUpperCase()

  if (validCodes.includes(inputCode)) {
    discountCode.value = inputCode
    discountPercentage.value = parseInt(inputCode.replace(/\D/g, ''))
    alert('Code promo appliqué avec succès !')
  } else {
    alert('Code promo invalide ou expiré')
  }

  promoInput.value = ''
  processing.value = false
}

const removePromoCode = () => {
  discountCode.value = ''
  discountPercentage.value = 0
}

// Traitement du paiement
const processPayment = async () => {
  if (!validateStep3()) return

  processing.value = true
  showProcessingModal.value = true
  processingStep.value = 0

  // Simulation des étapes de traitement
  const steps = [
    'Validation des informations',
    'Connexion au système de paiement',
    'Traitement de la transaction',
    'Confirmation'
  ]

  for (let i = 0; i < steps.length; i++) {
    processingStep.value = i + 1
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  // Simuler un appel API
  try {
    // En production, ici vous auriez un appel API réel
    const paymentData = {
      orderNumber: orderNumber.value,
      customerInfo: customerInfo.value,
      paymentInfo: selectedMethod.value === 'credit_card' ? {
        ...paymentInfo.value,
        cardNumber: '**** **** **** ' + paymentInfo.value.cardNumber.slice(-4)
      } : null,
      paymentMethod: selectedMethod.value,
      courseId: course.value.id,
      amount: orderTotal.value,
      discountCode: discountCode.value,
      timestamp: new Date().toISOString()
    }

    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simuler une réponse réussie
    const success = Math.random() > 0.1 // 90% de chance de succès

    if (success) {
      // Simuler l'enregistrement de la commande
      localStorage.setItem('lastOrder', JSON.stringify(paymentData))

      // Redirection vers la page de confirmation
      setTimeout(() => {
        router.push({
          path: '/payment/confirmation',
          query: {
            order: orderNumber.value,
            course: course.value.id,
            amount: orderTotal.value
          }
        })
      }, 1000)
    } else {
      throw new Error('Échec du traitement du paiement')
    }

  } catch (error) {
    console.error('Erreur de paiement:', error)
    alert(`Erreur de paiement: ${error.message || 'Veuillez réessayer'}`)

    // Réessayer à l'étape 2
    currentStep.value = 2
  } finally {
    processing.value = false
    showProcessingModal.value = false
    processingStep.value = 0
  }
}

// Initialisation
onMounted(() => {
  // Charger les données du cours depuis l'API si un ID est fourni
  const courseId = route.params.courseId
  if (courseId) {
    // Ici, vous chargeriez les données du cours depuis votre API
    // Pour l'exemple, on simule des données
    fetchCourseData(courseId)
  }

  // Charger les informations sauvegardées si disponibles
  loadSavedInfo()
})

const fetchCourseData = async (courseId) => {
  // Simuler un appel API
  await new Promise(resolve => setTimeout(resolve, 500))

  // Pour la démo, on utilise des données statiques
  // En production, vous feriez un appel API réel
  course.value = {
    id: courseId,
    title: 'JavaScript Avancé - Formation Complète',
    description: 'Maîtrisez JavaScript moderne avec les dernières fonctionnalités ES6+',
    thumbnail: '/images/course1.jpg',
    category: 'Développement Web',
    instructor: 'Dr. Jean Dupont',
    duration: '25 heures',
    lessons: 42,
    price: 199.99
  }
}

const loadSavedInfo = () => {
  const savedInfo = localStorage.getItem('customerInfo')
  if (savedInfo) {
    try {
      customerInfo.value = { ...customerInfo.value, ...JSON.parse(savedInfo) }
    } catch (e) {
      console.error('Erreur de chargement des informations:', e)
    }
  }

  const savedCard = localStorage.getItem('savedCard')
  if (savedCard) {
    try {
      paymentInfo.value.cardName = JSON.parse(savedCard).cardName
    } catch (e) {
      console.error('Erreur de chargement de la carte:', e)
    }
  }
}

// Sauvegarder les informations si demandé
const saveCustomerInfo = () => {
  if (customerInfo.value.saveInfo) {
    const infoToSave = {
      fullName: customerInfo.value.fullName,
      email: customerInfo.value.email,
      phone: customerInfo.value.phone,
      address: customerInfo.value.address,
      city: customerInfo.value.city,
      postalCode: customerInfo.value.postalCode,
      country: customerInfo.value.country
    }
    localStorage.setItem('customerInfo', JSON.stringify(infoToSave))
  }
}

const saveCardInfo = () => {
  if (paymentInfo.value.saveCard && paymentInfo.value.cardName) {
    const cardToSave = {
      cardName: paymentInfo.value.cardName
    }
    localStorage.setItem('savedCard', JSON.stringify(cardToSave))
  }
}

// Sauvegarder quand l'utilisateur quitte la page
window.addEventListener('beforeunload', () => {
  saveCustomerInfo()
  saveCardInfo()
})

// Exposer les méthodes au template
defineExpose({
  currentStep,
  processing,
  course,
  orderNumber,
  orderTotal,
  customerInfo,
  paymentInfo,
  paymentMethods,
  selectedMethod,
  agreeTerms,
  promoInput,
  discountCode,
  discountAmount,
  formatPrice,
  nextStep,
  previousStep,
  selectPaymentMethod,
  applyPromoCode,
  removePromoCode,
  processPayment,
  toggleCvcVisibility,
  copyToClipboard
})
</script>

<style scoped>
.payment-checkout-view {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.checkout-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
}

.breadcrumb-nav {
  margin-bottom: 2rem;
}

.breadcrumb {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
}

.breadcrumb-item {
  margin-right: 0.5rem;
}

.breadcrumb-item:not(:last-child)::after {
  content: '›';
  margin-left: 0.5rem;
  opacity: 0.7;
}

.breadcrumb-item a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-item a:hover {
  color: white;
}

.breadcrumb-item.active {
  color: white;
  opacity: 0.7;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.secure-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.secure-badge i {
  font-size: 2rem;
}

.secure-text {
  display: flex;
  flex-direction: column;
}

.secure-title {
  font-weight: 600;
  font-size: 1.1rem;
}

.secure-subtitle {
  font-size: 0.9rem;
  opacity: 0.8;
}

.checkout-main {
  padding: 3rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  align-items: start;
}

.checkout-process {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.checkout-step {
  padding: 2rem;
  border-bottom: 1px solid #e9ecef;
}

.checkout-step:last-child {
  border-bottom: none;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.checkout-step.active .step-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: scale(1.1);
}

.checkout-step.completed .step-number {
  background: #28a745;
  color: white;
}

.step-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #212529;
}

.step-description {
  color: #6c757d;
  margin: 0;
  font-size: 0.95rem;
}

.step-content {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  background: white;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error,
.form-select.error {
  border-color: #dc3545;
}

.error-message {
  display: block;
  margin-top: 0.5rem;
  color: #dc3545;
  font-size: 0.875rem;
}

.input-with-icon {
  position: relative;
}

.card-icons {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 0.5rem;
}

.btn-show-cvc {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
}

.btn-show-cvc:hover {
  color: #495057;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 0.75rem;
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

.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

.btn-primary,
.btn-secondary {
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.payment-methods {
  margin-bottom: 2rem;
}

.methods-header {
  margin-bottom: 1.5rem;
}

.methods-header h4 {
  margin: 0;
  color: #212529;
}

.methods-grid {
  display: grid;
  gap: 1rem;
}

.method-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.method-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.method-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.method-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #667eea;
}

.method-info {
  flex: 1;
}

.method-info h5 {
  margin: 0 0 0.25rem 0;
  color: #212529;
}

.method-info p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.method-check {
  opacity: 0;
  color: #28a745;
  font-size: 1.25rem;
  transition: opacity 0.2s;
}

.method-card.active .method-check {
  opacity: 1;
}

.credit-card-form,
.paypal-info,
.mobile-money-form,
.bank-transfer-info {
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.paypal-logo {
  text-align: center;
  margin-bottom: 1.5rem;
}

.paypal-logo i {
  font-size: 4rem;
  color: #003087;
}

.paypal-description {
  text-align: center;
  color: #6c757d;
  margin-bottom: 2rem;
}

.paypal-benefits {
  display: grid;
  gap: 1rem;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #28a745;
}

.payment-instructions,
.transfer-instructions {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.payment-instructions h5,
.transfer-instructions h5 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #212529;
}

.payment-instructions ol,
.payment-instructions ul,
.transfer-instructions ol,
.transfer-instructions ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #6c757d;
}

.payment-instructions li,
.transfer-instructions li {
  margin-bottom: 0.5rem;
}

.bank-details {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e9ecef;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #495057;
  min-width: 120px;
}

.detail-value {
  flex: 1;
  font-family: 'Courier New', monospace;
  color: #212529;
}

.btn-copy {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-copy:hover {
  background: #f8f9fa;
  color: #495057;
}

.confirmation-summary {
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
}

.summary-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
}

.summary-header h4 {
  margin: 0;
}

.summary-content {
  padding: 2rem;
}

.product-summary {
  display: flex;
  gap: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 1.5rem;
}

.item-thumbnail {
  width: 100px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
}

.item-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-details h5 {
  margin: 0 0 0.5rem 0;
  color: #212529;
}

.item-details p {
  margin: 0 0 1rem 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.item-meta {
  display: flex;
  gap: 1.5rem;
  color: #6c757d;
  font-size: 0.875rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #212529;
}

.summary-section {
  margin-bottom: 2rem;
}

.summary-section h5 {
  margin-bottom: 1rem;
  color: #212529;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-item {
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.info-label {
  font-weight: 500;
  color: #495057;
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.info-value {
  color: #212529;
  display: block;
}

.payment-method-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.payment-method-display i {
  font-size: 2rem;
  color: #667eea;
}

.method-info {
  display: flex;
  flex-direction: column;
}

.method-name {
  font-weight: 600;
  color: #212529;
}

.method-description {
  color: #6c757d;
  font-size: 0.875rem;
}

.payment-details {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row.total {
  font-weight: 700;
  font-size: 1.25rem;
  color: #212529;
}

.detail-row .discount {
  color: #28a745;
}

.terms-agreement {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 2rem 0;
}

.terms-text {
  line-height: 1.5;
}

.terms-text a {
  color: #667eea;
  text-decoration: none;
}

.terms-text a:hover {
  text-decoration: underline;
}

.checkout-summary {
  position: sticky;
  top: 2rem;
}

.summary-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 2rem;
}

.product-summary {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.product-header h4 {
  margin: 0;
}

.order-number {
  font-size: 0.875rem;
  color: #6c757d;
  background: #f8f9fa;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
}

.product-item {
  display: flex;
  gap: 1rem;
}

.product-image {
  width: 80px;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details {
  flex: 1;
}

.product-details h5 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.product-category {
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
}

.product-instructor {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0;
}

.product-price {
  font-weight: 700;
  color: #212529;
  font-size: 1.1rem;
}

.promo-section {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.promo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.promo-header h5 {
  margin: 0;
}

.btn-remove-promo {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.btn-remove-promo:hover {
  background: #fff5f5;
}

.promo-input {
  display: flex;
  gap: 0.5rem;
}

.promo-input input {
  flex: 1;
}

.btn-apply {
  padding: 0.875rem 1.5rem;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-weight: 600;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-apply:hover:not(:disabled) {
  background: #e9ecef;
}

.btn-apply:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.promo-applied {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #d4edda;
  border-radius: 8px;
  color: #155724;
}

.promo-success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.promo-success i {
  font-size: 1.25rem;
}

.promo-discount {
  font-weight: 700;
  font-size: 1.1rem;
}

.price-summary {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  color: #6c757d;
}

.price-row.total {
  color: #212529;
  font-weight: 700;
  font-size: 1.25rem;
  border-top: 1px solid #e9ecef;
  margin-top: 0.75rem;
  padding-top: 1.25rem;
}

.guarantees {
  padding: 1.5rem;
}

.guarantee-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
}

.guarantee-item:not(:last-child) {
  border-bottom: 1px solid #f8f9fa;
}

.guarantee-item i {
  font-size: 1.5rem;
  color: #667eea;
  width: 40px;
}

.guarantee-text {
  display: flex;
  flex-direction: column;
}

.guarantee-title {
  font-weight: 600;
  color: #212529;
  font-size: 0.95rem;
}

.guarantee-desc {
  color: #6c757d;
  font-size: 0.875rem;
}

.payment-timeline {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
}

.timeline-step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
}

.timeline-step:not(:last-child) {
  border-bottom: 1px solid #f8f9fa;
}

.timeline-step.active .step-dot {
  background: #28a745;
}

.timeline-step.active .step-title {
  color: #212529;
}

.step-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e9ecef;
  transition: background 0.3s;
}

.step-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-title {
  color: #6c757d;
  font-weight: 500;
  transition: color 0.3s;
}

.step-time {
  color: #6c757d;
  font-size: 0.875rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-body {
  padding: 3rem;
}

.processing-content {
  text-align: center;
}

.processing-animation {
  margin-bottom: 2rem;
}

.loader {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.processing-content h3 {
  margin-bottom: 1rem;
  color: #212529;
}

.processing-content p {
  color: #6c757d;
  margin-bottom: 2rem;
}

.processing-steps {
  text-align: left;
  margin-top: 2rem;
}

.processing-step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  color: #6c757d;
  border-bottom: 1px solid #f8f9fa;
}

.processing-step:last-child {
  border-bottom: none;
}

.processing-step i {
  opacity: 0;
  color: #28a745;
  font-size: 1.25rem;
}

.processing-step.active {
  color: #212529;
}

.processing-step.active i {
  opacity: 1;
  animation: fadeInIcon 0.5s ease-out;
}

@keyframes fadeInIcon {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive */
@media (max-width: 992px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }

  .checkout-summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }

  .secure-badge {
    width: 100%;
    justify-content: center;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .step-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .modal-body {
    padding: 2rem;
  }
}

@media (max-width: 576px) {
  .checkout-step {
    padding: 1.5rem;
  }

  .method-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .product-summary {
    flex-direction: column;
  }

  .item-thumbnail {
    width: 100%;
    height: 150px;
  }

  .item-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>

