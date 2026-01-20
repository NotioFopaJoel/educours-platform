<template>
  <div class="register-form">
    <div class="form-header">
      <h1>Créer un compte</h1>
      <p class="subtitle">Rejoignez EDUCOURS et commencez votre apprentissage</p>
    </div>

    <form @submit.prevent="handleRegister" class="register-form-content">
      <div class="form-row">
        <div class="form-group">
          <label for="firstName">Prénom *</label>
          <input
            v-model="form.firstName"
            type="text"
            id="firstName"
            required
            placeholder="John"
            :class="{ 'input-error': errors.firstName }"
            @blur="validateField('firstName')"
          />
          <div v-if="errors.firstName" class="field-error">
            {{ errors.firstName }}
          </div>
        </div>

        <div class="form-group">
          <label for="lastName">Nom *</label>
          <input
            v-model="form.lastName"
            type="text"
            id="lastName"
            required
            placeholder="Doe"
            :class="{ 'input-error': errors.lastName }"
            @blur="validateField('lastName')"
          />
          <div v-if="errors.lastName" class="field-error">
            {{ errors.lastName }}
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="email">Email *</label>
        <input
          v-model="form.email"
          type="email"
          id="email"
          required
          placeholder="votre@email.com"
          :class="{ 'input-error': errors.email }"
          @blur="validateField('email')"
          @input="clearError('email')"
        />
        <div v-if="errors.email" class="field-error">
          {{ errors.email }}
        </div>
      </div>

      <div class="form-group">
        <label for="role">Je suis *</label>
        <div class="role-options">
          <label class="role-option" :class="{ 'selected': form.role === 'student' }">
            <input
              type="radio"
              v-model="form.role"
              value="student"
              required
            />
            <div class="role-content">
              <span class="role-icon">🎓</span>
              <div>
                <strong>Étudiant</strong>
                <p class="role-description">Je veux apprendre et suivre des cours</p>
              </div>
            </div>
          </label>

          <label class="role-option" :class="{ 'selected': form.role === 'teacher' }">
            <input
              type="radio"
              v-model="form.role"
              value="teacher"
              required
            />
            <div class="role-content">
              <span class="role-icon">👨‍🏫</span>
              <div>
                <strong>Enseignant</strong>
                <p class="role-description">Je veux créer et partager des cours</p>
              </div>
            </div>
          </label>
        </div>
        <div v-if="errors.role" class="field-error">
          {{ errors.role }}
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="password">Mot de passe *</label>
          <div class="password-input">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              id="password"
              required
              placeholder="••••••••"
              :class="{ 'input-error': errors.password }"
              @blur="validatePassword()"
              @input="validatePasswordStrength()"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
              tabindex="-1"
            >
              <span v-if="showPassword">👁️</span>
              <span v-else>👁️‍🗨️</span>
            </button>
          </div>
          <div v-if="errors.password" class="field-error">
            {{ errors.password }}
          </div>
          
          <!-- Indicateur de force du mot de passe -->
          <div v-if="form.password" class="password-strength">
            <div class="strength-text">
              Force du mot de passe: 
              <span :class="passwordStrength.class">{{ passwordStrength.text }}</span>
            </div>
            <div class="strength-bar">
              <div 
                class="strength-fill" 
                :style="{ width: passwordStrength.percentage + '%' }"
                :class="passwordStrength.class"
              ></div>
            </div>
            <ul class="password-requirements">
              <li :class="{ 'valid': passwordRequirements.minLength }">Au moins 8 caractères</li>
              <li :class="{ 'valid': passwordRequirements.uppercase }">Une lettre majuscule</li>
              <li :class="{ 'valid': passwordRequirements.lowercase }">Une lettre minuscule</li>
              <li :class="{ 'valid': passwordRequirements.number }">Un chiffre</li>
              <li :class="{ 'valid': passwordRequirements.special }">Un caractère spécial</li>
            </ul>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmer le mot de passe *</label>
          <div class="password-input">
            <input
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              id="confirmPassword"
              required
              placeholder="••••••••"
              :class="{ 'input-error': errors.confirmPassword }"
              @blur="validateField('confirmPassword')"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showConfirmPassword = !showConfirmPassword"
              tabindex="-1"
            >
              <span v-if="showConfirmPassword">👁️</span>
              <span v-else>👁️‍🗨️</span>
            </button>
          </div>
          <div v-if="errors.confirmPassword" class="field-error">
            {{ errors.confirmPassword }}
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            v-model="form.terms"
            required
          />
          <span>J'accepte les 
            <router-link to="/terms" target="_blank" class="link">
              Conditions d'utilisation
            </router-link>
            et la 
            <router-link to="/privacy" target="_blank" class="link">
              Politique de confidentialité
            </router-link>
            *
          </span>
        </label>
        <div v-if="errors.terms" class="field-error">
          {{ errors.terms }}
        </div>
      </div>

      <div class="form-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            v-model="form.newsletter"
          />
          <span>Je souhaite recevoir les actualités et offres spéciales d'EDUCOURS</span>
        </label>
      </div>

      <button 
        type="submit" 
        :disabled="isLoading || !isFormValid" 
        class="btn-register"
        :class="{ 'disabled': isLoading || !isFormValid }"
      >
        <span v-if="isLoading">
          <span class="spinner"></span>
          Création du compte...
        </span>
        <span v-else>S'inscrire</span>
      </button>

      <div v-if="successMessage" class="success-message">
        <span class="success-icon">✓</span>
        {{ successMessage }}
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div class="login-link">
        Déjà membre ? 
        <router-link to="/login" class="link">
          Se connecter
        </router-link>
      </div>

      <div class="divider">
        <span>Ou s'inscrire avec</span>
      </div>

      <div class="social-login">
        <button type="button" class="social-btn google-btn" @click="socialLogin('google')">
          <img src="https://www.google.com/favicon.ico" alt="Google" class="social-icon">
          Google
        </button>
        <button type="button" class="social-btn github-btn" @click="socialLogin('github')">
          <img src="https://github.com/favicon.ico" alt="GitHub" class="social-icon">
          GitHub
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'student',
  terms: false,
  newsletter: false
});

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
  terms: ''
});

const error = ref('');
const successMessage = ref('');
const isLoading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// Validation du formulaire
const isFormValid = computed(() => {
  return (
    form.firstName &&
    form.lastName &&
    form.email &&
    form.password &&
    form.confirmPassword &&
    form.role &&
    form.terms &&
    Object.values(errors).every(error => error === '') &&
    form.password === form.confirmPassword
  );
});

// Validation des champs
const validateField = (field) => {
  switch (field) {
    case 'firstName':
      if (!form.firstName.trim()) {
        errors.firstName = 'Le prénom est requis';
      } else if (form.firstName.length < 2) {
        errors.firstName = 'Le prénom doit contenir au moins 2 caractères';
      } else {
        errors.firstName = '';
      }
      break;

    case 'lastName':
      if (!form.lastName.trim()) {
        errors.lastName = 'Le nom est requis';
      } else if (form.lastName.length < 2) {
        errors.lastName = 'Le nom doit contenir au moins 2 caractères';
      } else {
        errors.lastName = '';
      }
      break;

    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!form.email.trim()) {
        errors.email = "L'email est requis";
      } else if (!emailRegex.test(form.email)) {
        errors.email = 'Veuillez entrer un email valide';
      } else {
        errors.email = '';
      }
      break;

    case 'password':
      validatePassword();
      break;

    case 'confirmPassword':
      if (!form.confirmPassword.trim()) {
        errors.confirmPassword = 'Veuillez confirmer votre mot de passe';
      } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Les mots de passe ne correspondent pas';
      } else {
        errors.confirmPassword = '';
      }
      break;

    case 'role':
      if (!form.role) {
        errors.role = 'Veuillez sélectionner un rôle';
      } else {
        errors.role = '';
      }
      break;

    case 'terms':
      if (!form.terms) {
        errors.terms = 'Vous devez accepter les conditions';
      } else {
        errors.terms = '';
      }
      break;
  }
};

// Validation du mot de passe
const passwordRequirements = reactive({
  minLength: false,
  uppercase: false,
  lowercase: false,
  number: false,
  special: false
});

const passwordStrength = reactive({
  text: 'Faible',
  class: 'weak',
  percentage: 0
});

const validatePasswordStrength = () => {
  const password = form.password;
  
  passwordRequirements.minLength = password.length >= 8;
  passwordRequirements.uppercase = /[A-Z]/.test(password);
  passwordRequirements.lowercase = /[a-z]/.test(password);
  passwordRequirements.number = /[0-9]/.test(password);
  passwordRequirements.special = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const requirementsMet = Object.values(passwordRequirements).filter(Boolean).length;
  
  if (password.length === 0) {
    passwordStrength.text = 'Faible';
    passwordStrength.class = 'weak';
    passwordStrength.percentage = 0;
  } else if (password.length < 8) {
    passwordStrength.text = 'Très faible';
    passwordStrength.class = 'very-weak';
    passwordStrength.percentage = 20;
  } else if (requirementsMet <= 2) {
    passwordStrength.text = 'Faible';
    passwordStrength.class = 'weak';
    passwordStrength.percentage = 40;
  } else if (requirementsMet === 3) {
    passwordStrength.text = 'Moyen';
    passwordStrength.class = 'medium';
    passwordStrength.percentage = 60;
  } else if (requirementsMet === 4) {
    passwordStrength.text = 'Fort';
    passwordStrength.class = 'strong';
    passwordStrength.percentage = 80;
  } else {
    passwordStrength.text = 'Très fort';
    passwordStrength.class = 'very-strong';
    passwordStrength.percentage = 100;
  }
};

const validatePassword = () => {
  if (!form.password.trim()) {
    errors.password = 'Le mot de passe est requis';
    return;
  }
  
  if (form.password.length < 8) {
    errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    return;
  }
  
  if (!/[A-Z]/.test(form.password)) {
    errors.password = 'Le mot de passe doit contenir au moins une majuscule';
    return;
  }
  
  if (!/[a-z]/.test(form.password)) {
    errors.password = 'Le mot de passe doit contenir au moins une minuscule';
    return;
  }
  
  if (!/[0-9]/.test(form.password)) {
    errors.password = 'Le mot de passe doit contenir au moins un chiffre';
    return;
  }
  
  errors.password = '';
};

// Effacer les erreurs
const clearError = (field) => {
  errors[field] = '';
  error.value = '';
};

// Soumission du formulaire
const handleRegister = async () => {
  try {
    // Valider tous les champs
    Object.keys(form).forEach(key => {
      if (errors[key] !== undefined) {
        validateField(key);
      }
    });
    
    // Vérifier s'il y a des erreurs
    if (Object.values(errors).some(error => error !== '')) {
      error.value = 'Veuillez corriger les erreurs dans le formulaire';
      return;
    }
    
    isLoading.value = true;
    error.value = '';
    successMessage.value = '';
    
    // Préparer les données pour l'API
    const userData = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      newsletter: form.newsletter
    };
    
    // Appeler le store d'authentification
    const result = await authStore.register(userData);
    
    if (result.success) {
      successMessage.value = 'Compte créé avec succès ! Redirection en cours...';
      
      // Réinitialiser le formulaire
      Object.keys(form).forEach(key => {
        form[key] = '';
      });
      form.role = 'student';
      form.terms = false;
      form.newsletter = false;
      
      // La redirection est gérée par authStore.register
    } else {
      error.value = result.error || 'Échec de la création du compte';
    }
    
  } catch (err) {
    console.error('Registration error:', err);
    
    if (err.response?.status === 409) {
      error.value = 'Cet email est déjà utilisé. Veuillez en choisir un autre.';
    } else if (err.code === 'ERR_NETWORK') {
      error.value = 'Erreur réseau. Vérifiez votre connexion internet.';
    } else {
      error.value = err.response?.data?.error || 'Une erreur est survenue lors de l\'inscription';
    }
    
  } finally {
    isLoading.value = false;
  }
};

// Connexion sociale
const socialLogin = (provider) => {
  // Ici tu intégreras plus tard l'authentification sociale
  console.log(`Social login with ${provider}`);
  error.value = `L'inscription avec ${provider} sera bientôt disponible`;
};

// Watch pour valider la confirmation du mot de passe
watch(
  () => [form.password, form.confirmPassword],
  () => {
    if (form.confirmPassword && form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    } else if (form.confirmPassword) {
      errors.confirmPassword = '';
    }
  }
);
</script>

<style scoped>
.register-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h1 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 0.95rem;
}

.register-form-content {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.input-error {
  border-color: #dc2626 !important;
}

.field-error {
  color: #dc2626;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  min-height: 1.2rem;
}

/* Options de rôle */
.role-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.role-option {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.role-option:hover {
  border-color: #c7d2fe;
  background: #f8fafc;
}

.role-option.selected {
  border-color: #4f46e5;
  background: #f5f3ff;
}

.role-option input[type="radio"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.role-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.role-icon {
  font-size: 1.5rem;
}

.role-content strong {
  display: block;
  margin-bottom: 0.25rem;
  color: #333;
}

.role-description {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}

/* Input mot de passe */
.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 0.25rem;
  font-size: 1.1rem;
  line-height: 1;
}

.toggle-password:hover {
  color: #4f46e5;
}

/* Force du mot de passe */
.password-strength {
  margin-top: 0.5rem;
}

.strength-text {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.strength-text span {
  font-weight: 600;
}

.strength-text span.very-weak { color: #dc2626; }
.strength-text span.weak { color: #ea580c; }
.strength-text span.medium { color: #ca8a04; }
.strength-text span.strong { color: #16a34a; }
.strength-text span.very-strong { color: #059669; }

.strength-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s, background-color 0.3s;
}

.strength-fill.very-weak { background-color: #dc2626; }
.strength-fill.weak { background-color: #ea580c; }
.strength-fill.medium { background-color: #ca8a04; }
.strength-fill.strong { background-color: #16a34a; }
.strength-fill.very-strong { background-color: #059669; }

.password-requirements {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
  font-size: 0.75rem;
  color: #666;
}

.password-requirements li {
  display: flex;
  align-items: center;
  margin-bottom: 0.25rem;
  position: relative;
  padding-left: 1.2rem;
}

.password-requirements li::before {
  content: '○';
  position: absolute;
  left: 0;
  font-size: 0.9rem;
}

.password-requirements li.valid {
  color: #16a34a;
}

.password-requirements li.valid::before {
  content: '✓';
  color: #16a34a;
}

/* Checkbox */
.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.checkbox-label input[type="checkbox"] {
  margin-top: 0.2rem;
  flex-shrink: 0;
}

.link {
  color: #4f46e5;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

/* Bouton d'inscription */
.btn-register {
  width: 100%;
  padding: 0.9rem;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.btn-register:hover:not(:disabled) {
  background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.btn-register:disabled,
.btn-register.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Messages */
.success-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 6px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.success-icon {
  font-weight: bold;
  font-size: 1.1rem;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 6px;
  font-size: 0.9rem;
}

/* Lien de connexion */
.login-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  margin: 1rem 0;
  color: #9ca3af;
  font-size: 0.85rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.divider span {
  padding: 0 1rem;
}

/* Connexion sociale */
.social-login {
  display: flex;
  gap: 0.75rem;
}

.social-btn {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.social-btn:hover {
  background: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.social-btn.google-btn:hover {
  border-color: #dc2626;
}

.social-btn.github-btn:hover {
  border-color: #333;
}

.social-icon {
  width: 18px;
  height: 18px;
}

/* Responsive */
@media (max-width: 640px) {
  .register-form {
    padding: 1.5rem;
    margin: 0 1rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .social-login {
    flex-direction: column;
  }
}
</style>