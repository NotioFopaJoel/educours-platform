<template>
  <div class="register-view">
    <div class="container">
      <div class="register-container">
        <!-- Colonne gauche : Formulaire -->
        <div class="register-form-section">
          <div class="form-header">
            <router-link to="/" class="logo-link">
              <i class="icon-graduation-cap"></i>
              <span class="logo-text">EDUCOURS</span>
            </router-link>
            <h1>Créer votre compte</h1>
            <p>Rejoignez notre communauté d'apprenants et commencez votre voyage d'apprentissage</p>
          </div>

          <!-- Étapes d'inscription -->
          <div class="registration-steps">
            <div class="steps-indicator">
              <div
                  v-for="(step, index) in steps"
                  :key="step.id"
                  class="step-item"
                  :class="{
                  active: currentStep === step.id,
                  completed: completedSteps.includes(step.id)
                }"
                  @click="goToStep(step.id)"
              >
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-info">
                  <span class="step-title">{{ step.title }}</span>
                  <span class="step-description">{{ step.description }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Formulaire par étapes -->
          <div class="form-steps">
            <!-- Étape 1 : Informations de base -->
            <div v-show="currentStep === 'basic'" class="form-step">
              <form @submit.prevent="validateStep1">
                <div class="form-grid">
                  <div class="form-group">
                    <label for="firstName">Prénom *</label>
                    <input
                        type="text"
                        id="firstName"
                        v-model="formData.firstName"
                        :class="{ 'form-input': true, 'error': errors.firstName }"
                        placeholder="Jean"
                        autofocus
                    >
                    <span v-if="errors.firstName" class="error-message">{{ errors.firstName }}</span>
                  </div>

                  <div class="form-group">
                    <label for="lastName">Nom *</label>
                    <input
                        type="text"
                        id="lastName"
                        v-model="formData.lastName"
                        :class="{ 'form-input': true, 'error': errors.lastName }"
                        placeholder="Dupont"
                    >
                    <span v-if="errors.lastName" class="error-message">{{ errors.lastName }}</span>
                  </div>

                  <div class="form-group">
                    <label for="email">Email *</label>
                    <input
                        type="email"
                        id="email"
                        v-model="formData.email"
                        :class="{ 'form-input': true, 'error': errors.email }"
                        placeholder="jean@exemple.com"
                    >
                    <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                  </div>

                  <div class="form-group">
                    <label for="phone">Téléphone</label>
                    <input
                        type="tel"
                        id="phone"
                        v-model="formData.phone"
                        :class="{ 'form-input': true, 'error': errors.phone }"
                        placeholder="+33 6 12 34 56 78"
                    >
                    <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
                  </div>

                  <div class="form-group">
                    <label for="password">Mot de passe *</label>
                    <div class="password-input">
                      <input
                          :type="showPassword ? 'text' : 'password'"
                          id="password"
                          v-model="formData.password"
                          :class="{ 'form-input': true, 'error': errors.password }"
                          placeholder="Créez un mot de passe sécurisé"
                      >
                      <button
                          type="button"
                          class="btn-toggle-password"
                          @click="togglePasswordVisibility"
                      >
                        <i :class="showPassword ? 'icon-eye-off' : 'icon-eye'"></i>
                      </button>
                    </div>
                    <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
                    <div class="password-strength">
                      <div class="strength-meter">
                        <div
                            class="strength-fill"
                            :style="{ width: passwordStrength + '%' }"
                            :class="passwordStrengthClass"
                        ></div>
                      </div>
                      <span class="strength-text">{{ passwordStrengthText }}</span>
                    </div>
                    <div class="password-requirements">
                      <p>Le mot de passe doit contenir :</p>
                      <ul>
                        <li :class="{ valid: hasMinLength }">
                          <i :class="hasMinLength ? 'icon-check' : 'icon-x'"></i>
                          Au moins 8 caractères
                        </li>
                        <li :class="{ valid: hasUpperCase }">
                          <i :class="hasUpperCase ? 'icon-check' : 'icon-x'"></i>
                          Une lettre majuscule
                        </li>
                        <li :class="{ valid: hasLowerCase }">
                          <i :class="hasLowerCase ? 'icon-check' : 'icon-x'"></i>
                          Une lettre minuscule
                        </li>
                        <li :class="{ valid: hasNumber }">
                          <i :class="hasNumber ? 'icon-check' : 'icon-x'"></i>
                          Un chiffre
                        </li>
                        <li :class="{ valid: hasSpecialChar }">
                          <i :class="hasSpecialChar ? 'icon-check' : 'icon-x'"></i>
                          Un caractère spécial
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="confirmPassword">Confirmer le mot de passe *</label>
                    <div class="password-input">
                      <input
                          :type="showConfirmPassword ? 'text' : 'password'"
                          id="confirmPassword"
                          v-model="formData.confirmPassword"
                          :class="{ 'form-input': true, 'error': errors.confirmPassword }"
                          placeholder="Retapez votre mot de passe"
                      >
                      <button
                          type="button"
                          class="btn-toggle-password"
                          @click="toggleConfirmPasswordVisibility"
                      >
                        <i :class="showConfirmPassword ? 'icon-eye-off' : 'icon-eye'"></i>
                      </button>
                    </div>
                    <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
                  </div>
                </div>

                <div class="form-actions">
                  <router-link to="/login" class="btn-link">
                    <i class="icon-arrow-left"></i>
                    Déjà un compte ?
                  </router-link>
                  <button type="submit" class="btn-primary" :disabled="loading">
                    <span v-if="loading">
                      <i class="icon-loader"></i>
                      Vérification...
                    </span>
                    <span v-else>
                      Continuer
                      <i class="icon-arrow-right"></i>
                    </span>
                  </button>
                </div>
              </form>
            </div>

            <!-- Étape 2 : Profil -->
            <div v-show="currentStep === 'profile'" class="form-step">
              <form @submit.prevent="validateStep2">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Date de naissance</label>
                    <input
                        type="date"
                        v-model="formData.birthDate"
                        :class="{ 'form-input': true, 'error': errors.birthDate }"
                    >
                    <span v-if="errors.birthDate" class="error-message">{{ errors.birthDate }}</span>
                  </div>

                  <div class="form-group">
                    <label>Genre</label>
                    <div class="radio-group">
                      <label class="radio-label">
                        <input
                            type="radio"
                            v-model="formData.gender"
                            value="male"
                            class="radio-input"
                        >
                        <span class="radio-custom"></span>
                        Homme
                      </label>
                      <label class="radio-label">
                        <input
                            type="radio"
                            v-model="formData.gender"
                            value="female"
                            class="radio-input"
                        >
                        <span class="radio-custom"></span>
                        Femme
                      </label>
                      <label class="radio-label">
                        <input
                            type="radio"
                            v-model="formData.gender"
                            value="other"
                            class="radio-input"
                        >
                        <span class="radio-custom"></span>
                        Autre
                      </label>
                      <label class="radio-label">
                        <input
                            type="radio"
                            v-model="formData.gender"
                            value="prefer_not_to_say"
                            class="radio-input"
                        >
                        <span class="radio-custom"></span>
                        Préfère ne pas dire
                      </label>
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Pays *</label>
                    <select
                        v-model="formData.country"
                        :class="{ 'form-select': true, 'error': errors.country }"
                    >
                      <option value="">Sélectionnez votre pays</option>
                      <option value="FR">France</option>
                      <option value="BE">Belgique</option>
                      <option value="CH">Suisse</option>
                      <option value="CA">Canada</option>
                      <option value="SN">Sénégal</option>
                      <option value="CI">Côte d'Ivoire</option>
                      <option value="MA">Maroc</option>
                      <option value="TN">Tunisie</option>
                    </select>
                    <span v-if="errors.country" class="error-message">{{ errors.country }}</span>
                  </div>

                  <div class="form-group">
                    <label>Ville</label>
                    <input
                        type="text"
                        v-model="formData.city"
                        :class="{ 'form-input': true, 'error': errors.city }"
                        placeholder="Paris"
                    >
                    <span v-if="errors.city" class="error-message">{{ errors.city }}</span>
                  </div>

                  <div class="form-group">
                    <label>Niveau d'études</label>
                    <select
                        v-model="formData.educationLevel"
                        :class="{ 'form-select': true, 'error': errors.educationLevel }"
                    >
                      <option value="">Sélectionnez votre niveau</option>
                      <option value="bac">Baccalauréat</option>
                      <option value="bac+2">Bac+2 (BTS, DUT)</option>
                      <option value="bac+3">Bac+3 (Licence)</option>
                      <option value="bac+5">Bac+5 (Master)</option>
                      <option value="doctorat">Doctorat</option>
                      <option value="other">Autre</option>
                    </select>
                    <span v-if="errors.educationLevel" class="error-message">{{ errors.educationLevel }}</span>
                  </div>

                  <div class="form-group">
                    <label>Profession</label>
                    <input
                        type="text"
                        v-model="formData.profession"
                        :class="{ 'form-input': true, 'error': errors.profession }"
                        placeholder="Développeur web"
                    >
                    <span v-if="errors.profession" class="error-message">{{ errors.profession }}</span>
                  </div>

                  <div class="form-group full-width">
                    <label>À propos de vous</label>
                    <textarea
                        v-model="formData.bio"
                        :class="{ 'form-textarea': true, 'error': errors.bio }"
                        placeholder="Parlez-nous un peu de vous, de vos centres d'intérêt et de vos objectifs d'apprentissage..."
                        rows="4"
                    ></textarea>
                    <div class="char-counter">
                      {{ formData.bio?.length || 0 }}/500 caractères
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn-secondary" @click="previousStep">
                    <i class="icon-arrow-left"></i>
                    Retour
                  </button>
                  <button type="submit" class="btn-primary" :disabled="loading">
                    <span v-if="loading">
                      <i class="icon-loader"></i>
                      Vérification...
                    </span>
                    <span v-else>
                      Continuer
                      <i class="icon-arrow-right"></i>
                    </span>
                  </button>
                </div>
              </form>
            </div>

            <!-- Étape 3 : Préférences -->
            <div v-show="currentStep === 'preferences'" class="form-step">
              <form @submit.prevent="validateStep3">
                <div class="preferences-section">
                  <h3>Centres d'intérêt</h3>
                  <p class="section-description">
                    Sélectionnez vos domaines d'intérêt pour recevoir des recommandations personnalisées
                  </p>

                  <div class="interests-grid">
                    <div
                        v-for="interest in availableInterests"
                        :key="interest.id"
                        class="interest-card"
                        :class="{ selected: selectedInterests.includes(interest.id) }"
                        @click="toggleInterest(interest.id)"
                    >
                      <div class="interest-icon">
                        <i :class="interest.icon"></i>
                      </div>
                      <div class="interest-info">
                        <h4>{{ interest.name }}</h4>
                        <p>{{ interest.description }}</p>
                      </div>
                      <div class="interest-check">
                        <i class="icon-check"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="preferences-section">
                  <h3>Objectifs d'apprentissage</h3>
                  <p class="section-description">
                    Quels sont vos objectifs principaux sur notre plateforme ?
                  </p>

                  <div class="goals-grid">
                    <div
                        v-for="goal in availableGoals"
                        :key="goal.id"
                        class="goal-card"
                        :class="{ selected: selectedGoals.includes(goal.id) }"
                        @click="toggleGoal(goal.id)"
                    >
                      <div class="goal-content">
                        <h4>{{ goal.title }}</h4>
                        <p>{{ goal.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="preferences-section">
                  <h3>Préférences de communication</h3>

                  <div class="communication-preferences">
                    <div class="preference-item">
                      <label class="checkbox-label">
                        <input
                            type="checkbox"
                            v-model="formData.newsletter"
                            class="checkbox-input"
                        >
                        <span class="checkbox-custom"></span>
                        <div class="preference-info">
                          <h4>Newsletter hebdomadaire</h4>
                          <p>Recevez nos meilleurs cours et articles chaque semaine</p>
                        </div>
                      </label>
                    </div>

                    <div class="preference-item">
                      <label class="checkbox-label">
                        <input
                            type="checkbox"
                            v-model="formData.courseRecommendations"
                            class="checkbox-input"
                        >
                        <span class="checkbox-custom"></span>
                        <div class="preference-info">
                          <h4>Recommandations de cours</h4>
                          <p>Soyez notifié des nouveaux cours correspondant à vos intérêts</p>
                        </div>
                      </label>
                    </div>

                    <div class="preference-item">
                      <label class="checkbox-label">
                        <input
                            type="checkbox"
                            v-model="formData.promotionalEmails"
                            class="checkbox-input"
                        >
                        <span class="checkbox-custom"></span>
                        <div class="preference-info">
                          <h4>Offres promotionnelles</h4>
                          <p>Recevez des offres spéciales et des réductions</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn-secondary" @click="previousStep">
                    <i class="icon-arrow-left"></i>
                    Retour
                  </button>
                  <button type="submit" class="btn-primary" :disabled="loading">
                    <span v-if="loading">
                      <i class="icon-loader"></i>
                      Vérification...
                    </span>
                    <span v-else>
                      Continuer
                      <i class="icon-arrow-right"></i>
                    </span>
                  </button>
                </div>
              </form>
            </div>

            <!-- Étape 4 : Vérification -->
            <div v-show="currentStep === 'verification'" class="form-step">
              <div class="verification-step">
                <div class="verification-header">
                  <div class="verification-icon">
                    <i class="icon-mail"></i>
                  </div>
                  <h2>Vérifiez votre email</h2>
                  <p class="verification-description">
                    Nous avons envoyé un code de vérification à
                    <strong>{{ formData.email }}</strong>
                  </p>
                </div>

                <form @submit.prevent="verifyEmail">
                  <div class="verification-code">
                    <div
                        v-for="(digit, index) in verificationCode"
                        :key="index"
                        class="code-digit"
                    >
                      <input
                          type="text"
                          :ref="`codeInput${index}`"
                          v-model="verificationCode[index]"
                          maxlength="1"
                          @input="onCodeInput(index, $event)"
                          @keydown.delete="onCodeDelete(index, $event)"
                          @paste="onCodePaste"
                          :class="{ 'code-input': true, 'filled': verificationCode[index] }"
                      >
                    </div>
                  </div>

                  <div v-if="verificationError" class="error-message text-center">
                    {{ verificationError }}
                  </div>

                  <div class="verification-timer">
                    <p v-if="countdown > 0">
                      Vous pourrez renvoyer le code dans
                      <strong>{{ countdown }}</strong>
                    </p>
                    <button
                        v-else
                        type="button"
                        class="btn-resend"
                        @click="resendVerificationCode"
                        :disabled="resending"
                    >
                      <span v-if="resending">
                        <i class="icon-loader"></i>
                        Envoi en cours...
                      </span>
                      <span v-else>
                        <i class="icon-refresh-cw"></i>
                        Renvoyer le code
                      </span>
                    </button>
                  </div>

                  <div class="verification-note">
                    <p>
                      <i class="icon-info"></i>
                      Si vous ne recevez pas l'email, vérifiez votre dossier spam.
                      Le code expirera dans 15 minutes.
                    </p>
                  </div>

                  <div class="form-actions">
                    <button type="button" class="btn-secondary" @click="previousStep">
                      <i class="icon-arrow-left"></i>
                      Modifier l'email
                    </button>
                    <button type="submit" class="btn-primary" :disabled="verifying">
                      <span v-if="verifying">
                        <i class="icon-loader"></i>
                        Vérification...
                      </span>
                      <span v-else>
                        Vérifier
                        <i class="icon-arrow-right"></i>
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Étape 5 : Confirmation -->
            <div v-show="currentStep === 'confirmation'" class="form-step">
              <div class="confirmation-step">
                <div class="confirmation-animation">
                  <div class="success-checkmark">
                    <div class="check-icon">
                      <span class="icon-line line-tip"></span>
                      <span class="icon-line line-long"></span>
                      <div class="icon-circle"></div>
                      <div class="icon-fix"></div>
                    </div>
                  </div>
                </div>

                <div class="confirmation-content">
                  <h2>Félicitations !</h2>
                  <p class="confirmation-description">
                    Votre compte a été créé avec succès. Bienvenue sur EDUCOURS !
                  </p>

                  <div class="account-summary">
                    <div class="summary-item">
                      <i class="icon-user"></i>
                      <div class="summary-info">
                        <h4>Nom complet</h4>
                        <p>{{ formData.firstName }} {{ formData.lastName }}</p>
                      </div>
                    </div>
                    <div class="summary-item">
                      <i class="icon-mail"></i>
                      <div class="summary-info">
                        <h4>Email vérifié</h4>
                        <p>{{ formData.email }}</p>
                      </div>
                    </div>
                    <div class="summary-item">
                      <i class="icon-calendar"></i>
                      <div class="summary-info">
                        <h4>Compte créé le</h4>
                        <p>{{ new Date().toLocaleDateString('fr-FR') }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="next-steps">
                    <h3>Prochaines étapes</h3>
                    <div class="steps-grid">
                      <div class="step-card">
                        <div class="step-icon">
                          <i class="icon-user-check"></i>
                        </div>
                        <div class="step-content">
                          <h4>Complétez votre profil</h4>
                          <p>Ajoutez une photo et plus d'informations pour personnaliser votre expérience</p>
                        </div>
                      </div>
                      <div class="step-card">
                        <div class="step-icon">
                          <i class="icon-compass"></i>
                        </div>
                        <div class="step-content">
                          <h4>Explorez les cours</h4>
                          <p>Découvrez nos cours recommandés basés sur vos centres d'intérêt</p>
                        </div>
                      </div>
                      <div class="step-card">
                        <div class="step-icon">
                          <i class="icon-video"></i>
                        </div>
                        <div class="step-content">
                          <h4>Rejoignez un cours en direct</h4>
                          <p>Participez à nos prochaines sessions interactives</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="confirmation-actions">
                    <router-link to="/dashboard/admin/DashboardView.vue" class="btn-primary">
                      <i class="icon-layout"></i>
                      Accéder à mon tableau de bord
                    </router-link>
                    <router-link to="/courses/CourseListView.vue" class="btn-secondary">
                      <i class="icon-book"></i>
                      Explorer les cours
                    </router-link>
                  </div>

                  <div class="welcome-message">
                    <p>
                      <i class="icon-sparkles"></i>
                      Nous sommes ravis de vous accueillir dans notre communauté de
                      <strong>50,000+ apprenants</strong>.
                      Commencez votre voyage d'apprentissage dès maintenant !
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="form-footer">
            <p>
              En créant un compte, vous acceptez nos
              <router-link to="/terms" class="footer-link">Conditions d'utilisation</router-link>
              et notre
              <router-link to="/privacy" class="footer-link">Politique de confidentialité</router-link>
            </p>
            <p class="copyright">
              © 2024 EDUCOURS. Tous droits réservés.
            </p>
          </div>
        </div>

        <!-- Colonne droite : Bénéfices et témoignages -->
        <div class="register-benefits-section">
          <div class="benefits-container">
            <div class="benefits-header">
              <h2>Pourquoi rejoindre EDUCOURS ?</h2>
              <p>Découvrez ce qui fait de nous la plateforme d'apprentissage préférée</p>
            </div>

            <div class="benefits-list">
              <div class="benefit-item">
                <div class="benefit-icon">
                  <i class="icon-award"></i>
                </div>
                <div class="benefit-content">
                  <h3>Certifications reconnues</h3>
                  <p>Obtenez des certifications valorisées par les employeurs</p>
                </div>
              </div>

              <div class="benefit-item">
                <div class="benefit-icon">
                  <i class="icon-users"></i>
                </div>
                <div class="benefit-content">
                  <h3>Communauté active</h3>
                  <p>Rejoignez 50,000+ apprenants et échangez avec des experts</p>
                </div>
              </div>

              <div class="benefit-item">
                <div class="benefit-icon">
                  <i class="icon-video"></i>
                </div>
                <div class="benefit-content">
                  <h3>Cours en direct</h3>
                  <p>Interagissez en direct avec nos enseignants certifiés</p>
                </div>
              </div>

              <div class="benefit-item">
                <div class="benefit-icon">
                  <i class="icon-briefcase"></i>
                </div>
                <div class="benefit-content">
                  <h3>Carrière boostée</h3>
                  <p>86% de nos apprenants ont amélioré leur carrière</p>
                </div>
              </div>
            </div>

            <!-- Témoignages -->
            <div class="testimonials">
              <h3>Ce que disent nos apprenants</h3>

              <div class="testimonial-carousel">
                <div class="testimonial-item">
                  <div class="testimonial-content">
                    <p>"EDUCOURS a transformé ma carrière. Grâce aux cours certifiants, j'ai décroché une promotion."</p>
                  </div>
                  <div class="testimonial-author">
                    <div class="author-avatar">
                      <img src="/avatars/testimonial1.jpg" alt="Marie Dubois">
                    </div>
                    <div class="author-info">
                      <h4>Marie Dubois</h4>
                      <p>Développeuse Full Stack</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Statistiques -->
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">50,000+</div>
                <div class="stat-label">Apprenants actifs</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">98%</div>
                <div class="stat-label">Taux de satisfaction</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">500+</div>
                <div class="stat-label">Cours disponibles</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">24/7</div>
                <div class="stat-label">Support disponible</div>
              </div>
            </div>

            <!-- CTA -->
            <div class="cta-section">
              <h3>Prêt à transformer votre apprentissage ?</h3>
              <p>Inscrivez-vous gratuitement et commencez votre premier cours aujourd'hui.</p>
              <div class="cta-features">
                <div class="feature">
                  <i class="icon-check"></i>
                  <span>Accès gratuit aux cours d'introduction</span>
                </div>
                <div class="feature">
                  <i class="icon-check"></i>
                  <span>Annulation à tout moment</span>
                </div>
                <div class="feature">
                  <i class="icon-check"></i>
                  <span>Satisfait ou remboursé 30 jours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de chargement -->
    <div v-if="showLoadingModal" class="modal-overlay">
      <div class="modal modal-loading">
        <div class="modal-body">
          <div class="loading-content">
            <div class="loading-spinner">
              <div class="spinner"></div>
            </div>
            <h3>Création de votre compte</h3>
            <p>Veuillez patienter pendant que nous finalisons votre inscription...</p>
            <div class="loading-steps">
              <div class="loading-step" :class="{ active: loadingStep >= 1 }">
                <i class="icon-check"></i>
                <span>Validation des informations</span>
              </div>
              <div class="loading-step" :class="{ active: loadingStep >= 2 }">
                <i class="icon-check"></i>
                <span>Création du profil</span>
              </div>
              <div class="loading-step" :class="{ active: loadingStep >= 3 }">
                <i class="icon-check"></i>
                <span>Configuration de l'espace personnel</span>
              </div>
              <div class="loading-step" :class="{ active: loadingStep >= 4 }">
                <i class="icon-check"></i>
                <span>Finalisation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// États du formulaire
const currentStep = ref('basic')
const completedSteps = ref([])
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const showLoadingModal = ref(false)
const loadingStep = ref(0)

// États de vérification
const verificationCode = ref(['', '', '', '', '', ''])
const verificationError = ref('')
const countdown = ref(300) // 5 minutes
const verifying = ref(false)
const resending = ref(false)

// Données du formulaire
const formData = reactive({
  // Étape 1
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',

  // Étape 2
  birthDate: '',
  gender: '',
  country: '',
  city: '',
  educationLevel: '',
  profession: '',
  bio: '',

  // Étape 3
  newsletter: true,
  courseRecommendations: true,
  promotionalEmails: false
})

// Erreurs
const errors = reactive({})

// Centres d'intérêt
const selectedInterests = ref([])
const availableInterests = ref([
  {
    id: 'web_dev',
    name: 'Développement Web',
    description: 'HTML, CSS, JavaScript, Frameworks',
    icon: 'icon-code'
  },
  {
    id: 'mobile_dev',
    name: 'Développement Mobile',
    description: 'React Native, Flutter, iOS, Android',
    icon: 'icon-smartphone'
  },
  {
    id: 'data_science',
    name: 'Data Science',
    description: 'Python, Machine Learning, Analyse de données',
    icon: 'icon-database'
  },
  {
    id: 'design',
    name: 'Design UX/UI',
    description: 'Figma, Adobe XD, Design thinking',
    icon: 'icon-palette'
  },
  {
    id: 'marketing',
    name: 'Marketing Digital',
    description: 'SEO, Social Media, Content Marketing',
    icon: 'icon-bar-chart'
  },
  {
    id: 'business',
    name: 'Business & Entrepreneuriat',
    description: 'Gestion de projet, Leadership, Finance',
    icon: 'icon-briefcase'
  },
  {
    id: 'languages',
    name: 'Langues',
    description: 'Anglais, Espagnol, Allemand, Chinois',
    icon: 'icon-globe'
  },
  {
    id: 'soft_skills',
    name: 'Soft Skills',
    description: 'Communication, Management, Créativité',
    icon: 'icon-users'
  }
])

// Objectifs
const selectedGoals = ref([])
const availableGoals = ref([
  {
    id: 'career_change',
    title: 'Changer de carrière',
    description: 'Acquérir de nouvelles compétences pour une reconversion'
  },
  {
    id: 'skill_improvement',
    title: 'Améliorer mes compétences',
    description: 'Développer mes compétences actuelles'
  },
  {
    id: 'promotion',
    title: 'Obtenir une promotion',
    description: 'Me préparer pour une évolution professionnelle'
  },
  {
    id: 'personal_development',
    title: 'Développement personnel',
    description: 'Apprendre par curiosité et intérêt personnel'
  },
  {
    id: 'freelance',
    title: 'Devenir freelance',
    description: 'Développer des compétences pour travailler indépendamment'
  },
  {
    id: 'entrepreneurship',
    title: 'Créer mon entreprise',
    description: 'Acquérir les compétences nécessaires pour lancer mon business'
  }
])

// Étapes
const steps = ref([
  {
    id: 'basic',
    title: 'Informations de base',
    description: 'Vos coordonnées principales'
  },
  {
    id: 'profile',
    title: 'Profil personnel',
    description: 'À propos de vous'
  },
  {
    id: 'preferences',
    title: 'Préférences',
    description: 'Vos centres d\'intérêt'
  },
  {
    id: 'verification',
    title: 'Vérification',
    description: 'Confirmez votre email'
  },
  {
    id: 'confirmation',
    title: 'Confirmation',
    description: 'C\'est terminé !'
  }
])

// Calculs
const passwordStrength = computed(() => {
  let strength = 0

  // Longueur minimale
  if (formData.password.length >= 8) strength += 20

  // Majuscule
  if (/[A-Z]/.test(formData.password)) strength += 20

  // Minuscule
  if (/[a-z]/.test(formData.password)) strength += 20

  // Chiffre
  if (/[0-9]/.test(formData.password)) strength += 20

  // Caractère spécial
  if (/[^A-Za-z0-9]/.test(formData.password)) strength += 20

  return strength
})

const passwordStrengthClass = computed(() => {
  if (passwordStrength.value < 40) return 'weak'
  if (passwordStrength.value < 80) return 'medium'
  return 'strong'
})

const passwordStrengthText = computed(() => {
  if (passwordStrength.value < 40) return 'Faible'
  if (passwordStrength.value < 80) return 'Moyen'
  return 'Fort'
})

const hasMinLength = computed(() => formData.password.length >= 8)
const hasUpperCase = computed(() => /[A-Z]/.test(formData.password))
const hasLowerCase = computed(() => /[a-z]/.test(formData.password))
const hasNumber = computed(() => /[0-9]/.test(formData.password))
const hasSpecialChar = computed(() => /[^A-Za-z0-9]/.test(formData.password))

// Calcul pour le compte à rebours
const formatCountdown = computed(() => {
  const minutes = Math.floor(countdown.value / 60)
  const seconds = countdown.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// ========== AJOUTEZ À PARTIR D'ICI ==========

// Fonction pour naviguer entre les étapes
const goToStep = (stepId) => {
  if (completedSteps.value.includes(stepId)) {
    currentStep.value = stepId
  }
}

const validateStep1 = () => {
  loading.value = true
  errors.value = {}

  // Validation simple
  let isValid = true

  if (!formData.firstName.trim()) {
    errors.firstName = 'Le prénom est requis'
    isValid = false
  }

  if (!formData.lastName.trim()) {
    errors.lastName = 'Le nom est requis'
    isValid = false
  }

  if (!formData.email.trim()) {
    errors.email = 'L\'email est requis'
    isValid = false
  } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
    errors.email = 'Format d\'email invalide'
    isValid = false
  }

  if (formData.password.length < 8) {
    errors.password = 'Le mot de passe doit avoir au moins 8 caractères'
    isValid = false
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    isValid = false
  }

  setTimeout(() => {
    loading.value = false
    if (isValid) {
      completedSteps.value.push('basic')
      currentStep.value = 'profile'
    }
  }, 1000)
}

const validateStep2 = () => {
  loading.value = true
  errors.value = {}

  let isValid = true

  if (!formData.country) {
    errors.country = 'Le pays est requis'
    isValid = false
  }

  setTimeout(() => {
    loading.value = false
    if (isValid) {
      if (!completedSteps.value.includes('profile')) {
        completedSteps.value.push('profile')
      }
      currentStep.value = 'preferences'
    }
  }, 1000)
}

const validateStep3 = () => {
  loading.value = true
  const generatetedCode = Math.floor(100000 + Math.random() * 900000)

  console.log(' Code de verification (pour test):', generatetedCode)
  console.log(' Envoye a:', formData.email)

  window.testVerificationCode = generatetedCode.toString()

  setTimeout(() => {
    loading.value = false
    if (!completedSteps.value.includes('preferences')) {
      completedSteps.value.push('preferences')
    }
    currentStep.value = 'verification'
    // Commencer le compte à rebours
    startCountdown()
  }, 1000)
}

const previousStep = () => {
  const stepIndex = steps.value.findIndex(step => step.id === currentStep.value)
  if (stepIndex > 0) {
    currentStep.value = steps.value[stepIndex - 1].id
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const toggleInterest = (interestId) => {
  const index = selectedInterests.value.indexOf(interestId)
  if (index === -1) {
    selectedInterests.value.push(interestId)
  } else {
    selectedInterests.value.splice(index, 1)
  }
}

const toggleGoal = (goalId) => {
  const index = selectedGoals.value.indexOf(goalId)
  if (index === -1) {
    selectedGoals.value.push(goalId)
  } else {
    selectedGoals.value.splice(index, 1)
  }
}

const verifyEmail = async () => {
  verifying.value = true
  verificationError.value = ''

  const code = verificationCode.value.join('')

  // Simulation de vérification
  setTimeout(() => {
    if (code === window.testVerificationCode) { // Code test
      verifying.value = false
      if (!completedSteps.value.includes('verification')) {
        completedSteps.value.push('verification')
      }
      currentStep.value = 'confirmation'
    } else {
      verifying.value = false
      verificationError.value = 'Code de vérification incorrect'
      // Réinitialiser le code
      verificationCode.value = ['', '', '', '', '', '']
      // Focus sur le premier input
      setTimeout(() => {
        const firstInput = document.querySelector('input[ref="codeInput0"]')
        if (firstInput) firstInput.focus()
      }, 100)
    }
  }, 1500)
}

const resendVerificationCode = async () => {
  resending.value = true

  setTimeout(() => {
    resending.value = false
    countdown.value = 300 // Redémarrer à 5 minutes
    startCountdown()
    verificationError.value = 'Nouveau code envoyé !'
  }, 1000)
}

const onCodeInput = (index, event) => {
  const value = event.target.value

  // N'accepter que les chiffres
  if (value && !/^\d$/.test(value)) {
    verificationCode.value[index] = ''
    return
  }

  verificationCode.value[index] = value

  if (value && index < 5) {
    setTimeout(() => {
      const nextInput = document.querySelector(`input[ref="codeInput${index + 1}"]`)
      if (nextInput) {
        nextInput.focus()
      }
    }, 10)
  }
}

const onCodeDelete = (index, event) => {
  if (!verificationCode.value[index] && index > 0) {
    setTimeout(() => {
      const prevInput = document.querySelector(`input[ref="codeInput${index - 1}"]`)
      if (prevInput) {
        prevInput.focus()
      }
    }, 10)
  }
}

const onCodePaste = (event) => {
  const paste = event.clipboardData.getData('text')
  if (paste.length === 6 && /^\d+$/.test(paste)) {
    for (let i = 0; i < 6; i++) {
      verificationCode.value[i] = paste[i]
    }
    // Focus sur le dernier input
    setTimeout(() => {
      const lastInput = document.querySelector('input[ref="codeInput5"]')
      if (lastInput) {
        lastInput.focus()
      }
    }, 10)
    event.preventDefault()
  }
}

// Fonction pour démarrer le compte à rebours
const startCountdown = () => {
  if (countdown.value <= 0) return

  const timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

// Démarrer le compte à rebours au montage si on est à l'étape vérification
onMounted(() => {
  if (currentStep.value === 'verification') {
    startCountdown()
  }
})


</script>

<style scoped>
.register-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.register-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.register-form-section {
  padding: 3rem;
}

.form-header {
  margin-bottom: 2.5rem;
}

.logo-link {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  text-decoration: none;
  color: #4f46e5;
  font-weight: 700;
  font-size: 1.5rem;
}

.logo-link i {
  font-size: 2rem;
}

.form-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.form-header p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.registration-steps {
  margin-bottom: 2.5rem;
}

.steps-indicator {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #e5e7eb;
}

.step-item:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.step-item.active {
  border-color: #4f46e5;
  background: rgba(79, 70, 229, 0.05);
}

.step-item.completed {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.step-number {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  font-weight: 600;
}

.step-item.active .step-number {
  background: #4f46e5;
  color: white;
}

.step-item.completed .step-number {
  background: #10b981;
  color: white;
}

.step-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.step-title {
  font-weight: 600;
  color: #1f2937;
}

.step-description {
  font-size: 0.875rem;
  color: #6b7280;
}

.form-step {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-input.error,
.form-select.error,
.form-textarea.error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.password-input {
  position: relative;
}

.btn-toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.strength-meter {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.strength-fill.weak {
  background: #ef4444;
}

.strength-fill.medium {
  background: #f59e0b;
}

.strength-fill.strong {
  background: #10b981;
}

.strength-text {
  font-size: 0.875rem;
  font-weight: 500;
  min-width: 50px;
}

.password-requirements {
  margin-top: 0.75rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.password-requirements p {
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.password-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.password-requirements li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.password-requirements li.valid {
  color: #10b981;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.3s ease;
}

.radio-label:hover {
  background: #f9fafb;
}

.radio-input {
  display: none;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
}

.radio-input:checked + .radio-custom {
  border-color: #4f46e5;
}

.radio-input:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background: #4f46e5;
  border-radius: 50%;
}

.char-counter {
  text-align: right;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.preferences-section {
  margin-bottom: 2.5rem;
}

.preferences-section h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.section-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.interests-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.interest-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.interest-card:hover {
  border-color: #d1d5db;
  transform: translateY(-2px);
}

.interest-card.selected {
  border-color: #4f46e5;
  background: rgba(79, 70, 229, 0.05);
}

.interest-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 12px;
  color: #4f46e5;
  font-size: 1.5rem;
}

.interest-info h4 {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  color: #1f2937;
}

.interest-info p {
  font-size: 0.75rem;
  color: #6b7280;
}

.interest-check {
  position: absolute;
  top: 12px;
  right: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.interest-card.selected .interest-check {
  opacity: 1;
  color: #4f46e5;
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.goal-card {
  padding: 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.goal-card:hover {
  border-color: #d1d5db;
}

.goal-card.selected {
  border-color: #4f46e5;
  background: rgba(79, 70, 229, 0.05);
}

.goal-content h4 {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.goal-content p {
  font-size: 0.75rem;
  color: #6b7280;
}

.communication-preferences {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preference-item {
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: border-color 0.3s ease;
}

.preference-item:hover {
  border-color: #d1d5db;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  cursor: pointer;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  position: relative;
  margin-top: 0.25rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.checkbox-input:checked + .checkbox-custom {
  border-color: #4f46e5;
  background: #4f46e5;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
}

.preference-info h4 {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  color: #1f2937;
}

.preference-info p {
  font-size: 0.75rem;
  color: #6b7280;
}

.verification-step {
  text-align: center;
}

.verification-header {
  margin-bottom: 2.5rem;
}

.verification-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(79, 70, 229, 0.1);
  border-radius: 50%;
  color: #4f46e5;
  font-size: 2.5rem;
}

.verification-step h2 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.verification-description {
  color: #6b7280;
  font-size: 1rem;
}

.verification-code {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.code-digit {
  width: 56px;
  height: 56px;
}

.code-input {
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.code-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.code-input.filled {
  border-color: #4f46e5;
  background: rgba(79, 70, 229, 0.05);
}

.text-center {
  text-align: center;
}

.verification-timer {
  margin-bottom: 1.5rem;
}

.btn-resend {
  background: none;
  border: none;
  color: #4f46e5;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background 0.3s ease;
}

.btn-resend:hover:not(:disabled) {
  background: #f9fafb;
}

.btn-resend:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.verification-note {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.verification-note p {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.confirmation-step {
  text-align: center;
}

.confirmation-animation {
  margin-bottom: 2.5rem;
}

.success-checkmark {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  position: relative;
}

.check-icon {
  width: 120px;
  height: 120px;
  position: relative;
  transform: scale(0.5);
  animation: scaleUp 0.5s ease forwards;
}

@keyframes scaleUp {
  to {
    transform: scale(1);
  }
}

.icon-line {
  position: absolute;
  display: block;
  background: #10b981;
  border-radius: 2px;
}

.line-tip {
  width: 50px;
  height: 5px;
  top: 60px;
  left: 26px;
  transform: rotate(45deg);
  animation: lineTip 0.75s ease forwards;
}

.line-long {
  width: 90px;
  height: 5px;
  top: 53px;
  right: 30px;
  transform: rotate(-45deg);
  animation: lineLong 0.75s ease forwards;
}

.icon-circle {
  width: 120px;
  height: 120px;
  border: 5px solid #10b981;
  border-radius: 50%;
  animation: circleAnimation 0.6s ease forwards;
}

.icon-fix {
  width: 10px;
  height: 5px;
  background: white;
  position: absolute;
  top: 59px;
  left: 35px;
  transform: rotate(-45deg);
  animation: iconFix 1s ease forwards;
}

@keyframes lineTip {
  0% { width: 0; left: 1px; top: 62px; }
  54% { width: 0; left: 1px; top: 62px; }
  70% { width: 50px; left: 26px; top: 60px; }
  84% { width: 17px; left: 59px; top: 51px; }
  100% { width: 50px; left: 26px; top: 60px; }
}

@keyframes lineLong {
  0% { width: 0; right: 46px; top: 66px; }
  65% { width: 0; right: 46px; top: 66px; }
  84% { width: 55px; right: 0px; top: 45px; }
  100% { width: 90px; right: 30px; top: 53px; }
}

@keyframes circleAnimation {
  0% { transform: rotate(-45deg); opacity: 0; }
  100% { transform: rotate(-45deg); opacity: 1; }
}

@keyframes iconFix {
  0% { width: 0; left: 35px; top: 59px; }
  100% { width: 10px; left: 35px; top: 59px; }
}

.confirmation-content h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #1f2937;
}

.confirmation-description {
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 2.5rem;
}

.account-summary {
  background: #f9fafb;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2.5rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
}

.summary-item:not(:last-child) {
  border-bottom: 1px solid #e5e7eb;
}

.summary-item i {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  color: #4f46e5;
  font-size: 1.25rem;
}

.summary-info h4 {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.summary-info p {
  font-weight: 500;
  color: #1f2937;
}

.next-steps {
  margin-bottom: 2.5rem;
}

.next-steps h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #1f2937;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.step-card {
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.step-card:hover {
  border-color: #4f46e5;
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.step-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(79, 70, 229, 0.1);
  border-radius: 12px;
  color: #4f46e5;
  font-size: 1.5rem;
}

.step-content h4 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.step-content p {
  font-size: 0.875rem;
  color: #6b7280;
}

.confirmation-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background: #4f46e5;
  color: white;
}

.btn-primary:hover {
  background: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
}

.btn-secondary {
  background: white;
  color: #4f46e5;
  border-color: #4f46e5;
}

.btn-secondary:hover {
  background: #f9fafb;
  transform: translateY(-2px);
}

.welcome-message {
  padding: 1.5rem;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border-radius: 16px;
  color: white;
}

.welcome-message p {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin: 0;
}

.welcome-message strong {
  font-weight: 700;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.btn-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #4f46e5;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.btn-link:hover {
  color: #4338ca;
}

.form-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.footer-link {
  color: #4f46e5;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover {
  text-decoration: underline;
}

.copyright {
  margin-top: 0.5rem;
  color: #9ca3af;
}

.register-benefits-section {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  padding: 3rem;
  overflow-y: auto;
  max-height: calc(100vh - 4rem);
}

.benefits-container {
  position: sticky;
  top: 0;
}

.benefits-header {
  margin-bottom: 3rem;
  text-align: center;
}

.benefits-header h2 {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.benefits-header p {
  opacity: 0.9;
  font-size: 1.125rem;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.benefit-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  color: #4f46e5;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.benefit-content h3 {
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
}

.benefit-content p {
  opacity: 0.9;
  font-size: 0.875rem;
  margin: 0;
}

.testimonials {
  margin-bottom: 3rem;
}

.testimonials h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.testimonial-carousel {
  position: relative;
}

.testimonial-item {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.testimonial-content {
  margin-bottom: 1.5rem;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid white;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-info h4 {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.author-info p {
  opacity: 0.9;
  font-size: 0.875rem;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

.cta-section {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  text-align: center;
}

.cta-section h3 {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}

.cta-section p {
  opacity: 0.9;
  margin-bottom: 1.5rem;
}

.cta-features {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.feature i {
  color: #10b981;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-loading {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
  animation: modalIn 0.3s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-body {
  padding: 3rem;
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  margin-bottom: 2rem;
}

.spinner {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  border: 4px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  color: #1f2937;
}

.loading-content p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: #f9fafb;
  color: #9ca3af;
}

.loading-step.active {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.loading-step i {
  font-size: 1.25rem;
}

.loading-step span {
  font-weight: 500;
}

/* Responsive */
@media (max-width: 1200px) {
  .register-container {
    grid-template-columns: 1fr;
    max-width: 800px;
    margin: 0 auto;
  }

  .register-benefits-section {
    display: none;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .register-form-section {
    padding: 2rem 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .interests-grid,
  .goals-grid,
  .steps-grid {
    grid-template-columns: 1fr;
  }

  .confirmation-actions {
    flex-direction: column;
  }

  .password-requirements ul {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .form-header h1 {
    font-size: 1.75rem;
  }

  .step-item {
    padding: 0.75rem;
  }

  .verification-code {
    gap: 0.5rem;
  }

  .code-digit {
    width: 48px;
    height: 48px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .modal-body {
    padding: 2rem 1.5rem;
  }
}
</style>