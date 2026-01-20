<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-header">
        <router-link to="/" class="logo">
          <span class="logo-text">EDUCOURS</span>
        </router-link>
        <h1>Connectez-vous à votre compte</h1>
        <p>Accédez à vos cours et continuez votre apprentissage</p>
      </div>
      
      <div class="login-content">
        <LoginForm />
        
        <div class="social-login">
          <div class="divider">
            <span>Ou continuez avec</span>
          </div>
          
          <div class="social-buttons">
            <button class="social-btn google">
              <i class="icon-google"></i>
              Google
            </button>
            <button class="social-btn facebook">
              <i class="icon-facebook"></i>
              Facebook
            </button>
          </div>
        </div>
      </div>
      
      <div class="login-footer">
        <p>© 2024 EDUCOURS Platform. Tous droits réservés.</p>
        <div class="footer-links">
          <router-link to="/terms">Conditions d'utilisation</router-link>
          <router-link to="/privacy">Politique de confidentialité</router-link>
        </div>
      </div>
    </div>
    
    <div class="login-sidebar">
      <div class="sidebar-content">
        <h2>Rejoignez des milliers d'étudiants</h2>
        <p>Apprenez des meilleurs professeurs à travers le monde</p>
        
        <div class="testimonials">
          <div class="testimonial">
            <p>"EDUCOURS a transformé ma carrière. Les cours sont excellents !"</p>
            <div class="author">
              <img src="/images/testimonial1.jpg" alt="Étudiant">
              <div>
                <h4>Marie Dubois</h4>
                <span>Développeuse Full-Stack</span>
              </div>
            </div>
          </div>
          
          <div class="testimonial">
            <p>"La plateforme la plus intuitive que j'ai utilisée pour apprendre."</p>
            <div class="author">
              <img src="/images/testimonial2.jpg" alt="Étudiant">
              <div>
                <h4>Jean Martin</h4>
                <span>Data Scientist</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoginForm from '@/components/auth/LoginForm.vue';
</script>

<style scoped>
.login-view {
  display: flex;
  min-height: 100vh;
}

.login-container {
  flex: 1;
  max-width: 500px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-header {
  margin-bottom: 2rem;
}

.logo {
  display: inline-block;
  margin-bottom: 1.5rem;
  text-decoration: none;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4f46e5;
}

.login-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #6b7280;
}

.login-content {
  margin-bottom: 2rem;
}

.social-login {
  margin-top: 2rem;
}

.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: #9ca3af;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e5e7eb;
}

.divider span {
  padding: 0 1rem;
}

.social-buttons {
  display: flex;
  gap: 1rem;
}

.social-btn {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  background: white;
  color: #374151;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.social-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.social-btn.google i {
  color: #ea4335;
}

.social-btn.facebook i {
  color: #1877f2;
}

.login-footer {
  margin-top: auto;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.footer-links a {
  color: #6b7280;
  text-decoration: none;
}

.footer-links a:hover {
  text-decoration: underline;
}

.login-sidebar {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-content {
  max-width: 500px;
}

.sidebar-content h2 {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.sidebar-content p {
  font-size: 1.125rem;
  opacity: 0.9;
  margin-bottom: 3rem;
}

.testimonials {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.testimonial {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.testimonial p {
  font-style: italic;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.author h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.author span {
  font-size: 0.875rem;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .login-view {
    flex-direction: column;
  }
  
  .login-sidebar {
    display: none;
  }
  
  .login-container {
    max-width: 100%;
    padding: 1rem;
  }
}
</style>