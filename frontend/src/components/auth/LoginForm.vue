<template>
  <div class="login-form">
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          v-model="form.email"
          type="email"
          id="email"
          required
          placeholder="votre@email.com"
        />
      </div>
      
      <div class="form-group">
        <label for="password">Mot de passe</label>
        <input
          v-model="form.password"
          type="password"
          id="password"
          required
          placeholder="••••••••"
        />
      </div>
      
      <div class="form-options">
        <label class="remember-me">
          <input type="checkbox" v-model="form.remember" />
          Se souvenir de moi
        </label>
        <router-link to="/forgot-password" class="forgot-password">
          Mot de passe oublié ?
        </router-link>
      </div>
      
      <button type="submit" :disabled="isLoading" class="btn-login">
        <span v-if="isLoading">Connexion...</span>
        <span v-else>Se connecter</span>
      </button>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div class="signup-link">
        Nouveau sur EDUCOURS ? 
        <router-link to="/register">Créer un compte</router-link>
      </div>
    </form>
  </div>
</template>


<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  email: '',
  password: '',
  remember: false
});

const error = ref('');
const isLoading = ref(false);

// Charger l'email sauvegardé si "se souvenir de moi" était coché
onMounted(() => {
  const savedEmail = localStorage.getItem('rememberedEmail');
  if (savedEmail) {
    form.email = savedEmail;
    form.remember = true;
  }
});

const handleLogin = async () => {
  try {
    isLoading.value = true;
    error.value = '';

    // Sauvegarder l'email si "se souvenir de moi" est coché
    if (form.remember) {
      localStorage.setItem('rememberedEmail', form.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    // Appeler le store d'authentification
    const result = await authStore.login({
      email: form.email,
      password: form.password
    });

    if (result.success) {
      // Réinitialiser le formulaire
      form.email = '';
      form.password = '';

      // La redirection est gérée dans authStore.login
      // On peut ajouter une petite animation ou message ici si besoin

      // Forcer un refresh si besoin (si router  redirige pas)
      // router.go(0);
    } else {
      // Gérer l'erreur retournée par le store
      error.value = result.error || 'Échec de la connexion';
    }

  } catch (err) {
    // Erreur réseau ou autre exception
    console.error('Login error:', err);

    // Messages d'erreur plus spécifiques
    if (err.code === 'ERR_NETWORK') {
      error.value = 'Erreur réseau. Vérifiez votre connexion internet.';
    } else if (err.response?.status === 429) {
      error.value = 'Trop de tentatives. Veuillez réessayer plus tard.';
    } else if (err.response?.status === 403) {
      error.value = 'Accès refusé. Vérifiez vos identifiants.';
    } else {
      error.value = err.response?.data?.error || 'Une erreur est survenue lors de la connexion';
    }

  } finally {
    isLoading.value = false;
  }
};
</script>

<!-- <script setup>
import { ref, reactive } from 'vue';
import { useRouter } from "vue-router";
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  email: '',
  password: '',
  remember: false
});

const error = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  try {
    isLoading.value = true;
    error.value = '';
    
    await login({
      email: form.email,
      password: form.password
    });
    
    // Réinitialiser le formulaire
    form.email = '';
    form.password = '';
  } catch (err) {
    error.value = err.response?.data?.error || 'Erreur de connexion';
  } finally {
    isLoading.value = false;
  }
};
</script> -->

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #4f46e5;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.forgot-password {
  font-size: 0.9rem;
  color: #4f46e5;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.btn-login {
  width: 100%;
  padding: 0.75rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-login:hover:not(:disabled) {
  background: #4338ca;
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 5px;
  font-size: 0.9rem;
}

.signup-link {
  margin-top: 1.5rem;
  text-align: center;
  color: #666;
}

.signup-link a {
  color: #4f46e5;
  text-decoration: none;
  font-weight: 500;
}

.signup-link a:hover {
  text-decoration: underline;
}
</style>