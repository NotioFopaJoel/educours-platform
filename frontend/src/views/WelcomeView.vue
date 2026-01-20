<template>
  <div class="welcome-view">
    <!-- Navigation -->
    <nav class="navbar">
      <div class="container">
        <div class="navbar-content">
          <div class="navbar-brand">
            <span class="logo">EDUCOURS</span>
          </div>
          
          <div class="navbar-menu">
            <router-link to="/" class="nav-link active">Accueil</router-link>
            <a href="#features" class="nav-link">Fonctionnalités</a>
            <a href="#courses" class="nav-link">Cours</a>
            <a href="#pricing" class="nav-link">Tarifs</a>
            <a href="#contact" class="nav-link">Contact</a>
          </div>
          
          <div class="navbar-actions">
            <router-link to="/login" class="btn btn-outline">Se connecter</router-link>
            <router-link to="/register" class="btn btn-primary">S'inscrire gratuitement</router-link>
          </div>
          
          <button class="mobile-menu-btn" @click="toggleMobileMenu">
            <i class="fas fa-bars"></i>
          </button>
        </div>
        
        <!-- Mobile Menu -->
        <div class="mobile-menu" :class="{ 'active': mobileMenuOpen }">
          <router-link to="/" class="mobile-nav-link" @click="closeMobileMenu">Accueil</router-link>
          <a href="#features" class="mobile-nav-link" @click="closeMobileMenu">Fonctionnalités</a>
          <a href="#courses" class="mobile-nav-link" @click="closeMobileMenu">Cours</a>
          <a href="#pricing" class="mobile-nav-link" @click="closeMobileMenu">Tarifs</a>
          <a href="#contact" class="mobile-nav-link" @click="closeMobileMenu">Contact</a>
          <div class="mobile-actions">
            <router-link to="/login" class="btn btn-outline btn-block" @click="closeMobileMenu">Se connecter</router-link>
            <router-link to="/register" class="btn btn-primary btn-block" @click="closeMobileMenu">S'inscrire</router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              Apprenez avec les <span class="highlight">meilleurs</span> professeurs
            </h1>
            <p class="hero-subtitle">
              Rejoignez des milliers d'étudiants qui transforment leur carrière grâce à nos cours en ligne interactifs.
              Classes en direct, vidéos HD, et support personnalisé.
            </p>
            <div class="hero-actions">
              <router-link to="/register" class="btn btn-primary btn-lg">
                Commencer gratuitement
                <i class="fas fa-arrow-right"></i>
              </router-link>
              <router-link to="/courses" class="btn btn-outline btn-lg">
                Explorer les cours
              </router-link>
            </div>
            <div class="hero-stats">
              <div class="stat">
                <span class="stat-number">10,000+</span>
                <span class="stat-label">Étudiants actifs</span>
              </div>
              <div class="stat">
                <span class="stat-number">500+</span>
                <span class="stat-label">Cours disponibles</span>
              </div>
              <div class="stat">
                <span class="stat-number">98%</span>
                <span class="stat-label">Satisfaction</span>
              </div>
            </div>
          </div>
          <div class="hero-image">
            <img src="/images/hero-image.png" alt="Apprentissage en ligne" />
          </div>
        </div>
      </div>
      
      <!-- Wave Decoration -->
      <div class="wave">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
        </svg>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Pourquoi choisir EDUCOURS ?</h2>
          <p class="section-subtitle">
            Une plateforme complète conçue pour votre réussite
          </p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-video"></i>
            </div>
            <h3>Classes en Direct</h3>
            <p>
              Interagissez en temps réel avec vos professeurs grâce à notre système de vidéoconférence intégré.
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-chalkboard-teacher"></i>
            </div>
            <h3>Tableau Blanc Interactif</h3>
            <p>
              Participez activement aux cours avec notre tableau blanc collaboratif en temps réel.
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-file-alt"></i>
            </div>
            <h3>Devoirs & Évaluations</h3>
            <p>
              Recevez des feedbacks détaillés sur vos travaux et suivez votre progression.
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-mobile-alt"></i>
            </div>
            <h3>Mobile First</h3>
            <p>
              Accédez à vos cours depuis n'importe quel appareil, où que vous soyez.
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-shield-alt"></i>
            </div>
            <h3>Paiement Sécurisé</h3>
            <p>
              Transactions 100% sécurisées avec Stripe, PayPal et Mobile Money.
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-certificate"></i>
            </div>
            <h3>Certifications</h3>
            <p>
              Obtenez des certificats reconnus à la fin de chaque parcours.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Popular Courses -->
    <section id="courses" class="courses-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Cours Populaires</h2>
          <p class="section-subtitle">
            Découvrez nos cours les plus demandés
          </p>
        </div>
        
        <div class="courses-grid">
          <div class="course-card featured">
            <div class="course-badge">Populaire</div>
            <div class="course-image">
               <img src="/images/math-course.jpg" alt="Mathématiques Avancées" />
            </div>
            <div class="course-content">
              <div class="course-category">Mathématiques</div>
              <h3 class="course-title">Algèbre Linéaire Avancée</h3>
              <p class="course-description">
                Maîtrisez les concepts d'algèbre linéaire avec des applications pratiques.
              </p>
              <div class="course-meta">
                <span class="meta-item">
                  <i class="fas fa-clock"></i> 45 heures
                </span>
                <span class="meta-item">
                  <i class="fas fa-user-graduate"></i> 2,340 étudiants
                </span>
              </div>
              <div class="course-footer">
                <div class="course-price">
                  <span class="price">$89.99</span>
                  <span class="old-price">$129.99</span>
                </div>
                <router-link to="/courses/1" class="btn btn-primary">
                  Voir le cours
                </router-link>
              </div>
            </div>
          </div>
          
          <div class="course-card">
            <div class="course-image">
              <img src="/images/physics-course.jpg" alt="Physique Quantique" />
            </div>
            <div class="course-content">
              <div class="course-category">Physique</div>
              <h3 class="course-title">Introduction à la Physique Quantique</h3>
              <p class="course-description">
                Découvrez les mystères de la physique quantique avec des explications claires.
              </p>
              <div class="course-meta">
                <span class="meta-item">
                  <i class="fas fa-clock"></i> 36 heures
                </span>
                <span class="meta-item">
                  <i class="fas fa-user-graduate"></i> 1,850 étudiants
                </span>
              </div>
              <div class="course-footer">
                <div class="course-price">
                  <span class="price">$74.99</span>
                </div>
                <router-link to="/courses/2" class="btn btn-primary">
                  Voir le cours
                </router-link>
              </div>
            </div>
          </div>
          
          <div class="course-card">
            <div class="course-image">
              <img src="/images/cs-course.jpg" alt="Développement Web" />
            </div>
            <div class="course-content">
              <div class="course-category">Informatique</div>
              <h3 class="course-title">Développement Full-Stack</h3>
              <p class="course-description">
                Devenez développeur full-stack avec Vue.js, Node.js et MongoDB.
              </p>
              <div class="course-meta">
                <span class="meta-item">
                  <i class="fas fa-clock"></i> 60 heures
                </span>
                <span class="meta-item">
                  <i class="fas fa-user-graduate"></i> 3,120 étudiants
                </span>
              </div>
              <div class="course-footer">
                <div class="course-price">
                  <span class="price">$99.99</span>
                </div>
                <router-link to="/courses/3" class="btn btn-primary">
                  Voir le cours
                </router-link>
              </div>
            </div>
          </div>
        </div>
        
        <div class="section-cta">
          <router-link to="/courses" class="btn btn-outline btn-lg">
            Voir tous les cours
            <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="pricing-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Tarifs Transparents</h2>
          <p class="section-subtitle">
            Choisissez le plan qui correspond à vos besoins
          </p>
        </div>
        
        <div class="pricing-grid">
          <div class="pricing-card">
            <div class="pricing-header">
              <h3>Étudiant</h3>
              <div class="price">
                <span class="amount">$9.99</span>
                <span class="period">/mois</span>
              </div>
            </div>
            <div class="pricing-features">
              <ul>
                <li><i class="fas fa-check"></i> Accès à 5 cours</li>
                <li><i class="fas fa-check"></i> Vidéos pré-enregistrées</li>
                <li><i class="fas fa-check"></i> Support communautaire</li>
                <li><i class="fas fa-check"></i> Certificats de base</li>
                <li><i class="fas fa-times"></i> Classes en direct</li>
                <li><i class="fas fa-times"></i> Support individuel</li>
              </ul>
            </div>
            <div class="pricing-footer">
              <router-link to="/register?plan=student" class="btn btn-outline btn-block">
                Choisir ce plan
              </router-link>
            </div>
          </div>
          
          <div class="pricing-card popular">
            <div class="popular-badge">Recommandé</div>
            <div class="pricing-header">
              <h3>Professeur</h3>
              <div class="price">
                <span class="amount">$29.99</span>
                <span class="period">/mois</span>
              </div>
            </div>
            <div class="pricing-features">
              <ul>
                <li><i class="fas fa-check"></i> Cours illimités</li>
                <li><i class="fas fa-check"></i> Classes en direct</li>
                <li><i class="fas fa-check"></i> Tableau blanc interactif</li>
                <li><i class="fas fa-check"></i> Devoirs & évaluations</li>
                <li><i class="fas fa-check"></i> Support prioritaire</li>
                <li><i class="fas fa-check"></i> Paiements intégrés</li>
              </ul>
            </div>
            <div class="pricing-footer">
              <router-link to="/register?plan=teacher" class="btn btn-primary btn-block">
                Choisir ce plan
              </router-link>
            </div>
          </div>
          
          <div class="pricing-card">
            <div class="pricing-header">
              <h3>Entreprise</h3>
              <div class="price">
                <span class="amount">$99.99</span>
                <span class="period">/mois</span>
              </div>
            </div>
            <div class="pricing-features">
              <ul>
                <li><i class="fas fa-check"></i> Jusqu'à 50 utilisateurs</li>
                <li><i class="fas fa-check"></i> Cours personnalisés</li>
                <li><i class="fas fa-check"></i> Analytics avancées</li>
                <li><i class="fas fa-check"></i> API d'intégration</li>
                <li><i class="fas fa-check"></i> Support dédié</li>
                <li><i class="fas fa-check"></i> Formation sur site</li>
              </ul>
            </div>
            <div class="pricing-footer">
              <router-link to="/contact" class="btn btn-outline btn-block">
                Contactez-nous
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="testimonials-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Ce que disent nos étudiants</h2>
          <p class="section-subtitle">
            Découvrez les expériences de ceux qui ont transformé leur carrière
          </p>
        </div>
        
        <div class="testimonials-grid">
          <div class="testimonial-card">
            <div class="testimonial-content">
              <p>
                "EDUCOURS a complètement changé ma façon d'apprendre. Les classes en direct sont exceptionnelles !"
              </p>
            </div>
            <div class="testimonial-author">
              <img src="/images/testimonial1.jpg" alt="Marie Dubois" />
              <div class="author-info">
                <h4>Marie Dubois</h4>
                <span>Développeuse Full-Stack</span>
              </div>
            </div>
          </div>
          
          <div class="testimonial-card">
            <div class="testimonial-content">
              <p>
                "En tant que professeur, la plateforme offre tous les outils nécessaires pour créer des cours engageants."
              </p>
            </div>
            <div class="testimonial-author">
              <img src="/images/testimonial2.jpg" alt="Jean Martin" />
              <div class="author-info">
                <h4>Jean Martin</h4>
                <span>Professeur de Mathématiques</span>
              </div>
            </div>
          </div>
          
          <div class="testimonial-card">
            <div class="testimonial-content">
              <p>
                "Le système de paiement est très sécurisé et les cours sont d'une qualité exceptionnelle."
              </p>
            </div>
            <div class="testimonial-author">
              <img src="/images/testimonial3.jpg" alt="Sophie Laurent" />
              <div class="author-info">
                <h4>Sophie Laurent</h4>
                <span>Étudiante en Physique</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>Prêt à transformer votre apprentissage ?</h2>
          <p>
            Rejoignez notre communauté de plus de 10,000 apprenants dès aujourd'hui.
          </p>
          <div class="cta-actions">
            <router-link to="/register" class="btn btn-primary btn-lg">
              Commencer gratuitement
            </router-link>
            <router-link to="/contact" class="btn btn-outline btn-lg">
              Nous contacter
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer id="contact" class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <div class="footer-logo">EDUCOURS</div>
            <p>
              Plateforme d'apprentissage en ligne innovante qui connecte étudiants et professeurs du monde entier.
            </p>
            <div class="social-links">
              <a href="#" class="social-link"><i class="fab fa-facebook"></i></a>
              <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
              <a href="#" class="social-link"><i class="fab fa-linkedin"></i></a>
              <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
              <a href="#" class="social-link"><i class="fab fa-youtube"></i></a>
            </div>
          </div>
          
          <div class="footer-section">
            <h4>Plateforme</h4>
            <ul>
              <li><router-link to="/courses">Cours</router-link></li>
              <li><router-link to="/pricing">Tarifs</router-link></li>
              <li><router-link to="/features">Fonctionnalités</router-link></li>
              <li><router-link to="/live">Classes en direct</router-link></li>
              <li><router-link to="/certifications">Certifications</router-link></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h4>Entreprise</h4>
            <ul>
              <li><router-link to="/about">À propos</router-link></li>
              <li><router-link to="/careers">Carrières</router-link></li>
              <li><router-link to="/blog">Blog</router-link></li>
              <li><router-link to="/press">Presse</router-link></li>
              <li><router-link to="/partners">Partenaires</router-link></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h4>Support</h4>
            <ul>
              <li><router-link to="/help">Centre d'aide</router-link></li>
              <li><router-link to="/faq">FAQ</router-link></li>
              <li><router-link to="/contact">Contact</router-link></li>
              <li><router-link to="/terms">Conditions</router-link></li>
              <li><router-link to="/privacy">Confidentialité</router-link></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h4>Contact</h4>
            <ul class="contact-info">
              <li><i class="fas fa-map-marker-alt"></i> 123 Rue de l'Éducation, Paris, France</li>
              <li><i class="fas fa-phone"></i> +33 1 23 45 67 89</li>
              <li><i class="fas fa-envelope"></i> contact@educours.com</li>
            </ul>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; 2024 EDUCOURS Platform. Tous droits réservés.</p>
          <div class="footer-links">
            <router-link to="/terms">Conditions d'utilisation</router-link>
            <router-link to="/privacy">Politique de confidentialité</router-link>
            <router-link to="/cookies">Cookies</router-link>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

// Smooth scroll for anchor links
const handleAnchorClick = (e) => {
  const href = e.target.getAttribute('href');
  if (href && href.startsWith('#')) {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

// Attach smooth scroll to all anchor links
onMounted(() => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', handleAnchorClick);
  });
});
</script>

<style scoped>
.welcome-view {
  min-height: 100vh;
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--lighter-gray);
  padding: 1rem 0;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand .logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  font-family: var(--font-secondary);
}

.navbar-menu {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: var(--dark-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  padding: 0.5rem 0;
  position: relative;
}

.nav-link:hover,
.nav-link.active {
  color: var(--primary-color);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary-color);
}

.navbar-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--dark-color);
  cursor: pointer;
  padding: 0.5rem;
}

.mobile-menu {
  display: none;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid var(--lighter-gray);
  margin-top: 1rem;
}

.mobile-menu.active {
  display: flex;
}

.mobile-nav-link {
  color: var(--dark-color);
  text-decoration: none;
  padding: 0.75rem;
  border-radius: var(--border-radius);
  transition: background 0.3s;
}

.mobile-nav-link:hover {
  background: var(--lightest-gray);
}

.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

/* Hero Section */
.hero-section {
  padding: 8rem 0 4rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  font-weight: 700;
}

.hero-title .highlight {
  color: #fbbf24;
  position: relative;
}

.hero-title .highlight::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #fbbf24;
  border-radius: 2px;
}

.hero-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn-primary {
  background: white;
  color: var(--primary-color);
}

.btn-primary:hover {
  background: #f8fafc;
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  border: 2px solid white;
  color: white;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
}

.hero-stats {
  display: flex;
  gap: 3rem;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
  margin-top: 0.5rem;
}

.hero-image img {
  width: 100%;
  height: auto;
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-xl);
  transform: perspective(1000px) rotateY(-10deg);
  transition: transform 0.5s;
}

.hero-image img:hover {
  transform: perspective(1000px) rotateY(0deg);
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  color: var(--lightest-gray);
}

.wave svg {
  width: 100%;
  height: auto;
  display: block;
}

/* Features Section */
.features-section {
  padding: 6rem 0;
  background: var(--lightest-gray);
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--dark-color);
}

.section-subtitle {
  font-size: 1.125rem;
  color: var(--gray-color);
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid var(--lighter-gray);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  width: 80px;
  height: 80px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--dark-color);
}

.feature-card p {
  color: var(--gray-color);
  line-height: 1.6;
}

/* Courses Section */
.courses-section {
  padding: 6rem 0;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.course-card {
  background: white;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  border: 1px solid var(--lighter-gray);
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.course-card.featured {
  border: 2px solid var(--primary-color);
}

.course-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius);
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 1;
}

.course-image {
  height: 200px;
  overflow: hidden;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.course-card:hover .course-image img {
  transform: scale(1.05);
}

.course-content {
  padding: 1.5rem;
}

.course-category {
  color: var(--primary-color);
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.course-title {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--dark-color);
  line-height: 1.4;
}

.course-description {
  color: var(--gray-color);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.course-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--light-gray);
  font-size: 0.875rem;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-price .price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--dark-color);
}

.course-price .old-price {
  font-size: 1rem;
  color: var(--light-gray);
  text-decoration: line-through;
  margin-left: 0.5rem;
}

.section-cta {
  text-align: center;
}

/* Pricing Section */
.pricing-section {
  padding: 6rem 0;
  background: var(--lightest-gray);
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.pricing-card {
  background: white;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  border: 1px solid var(--lighter-gray);
  transition: transform 0.3s;
  position: relative;
}

.pricing-card.popular {
  border: 2px solid var(--primary-color);
  transform: scale(1.05);
}

.popular-badge {
  position: absolute;
  top: 0;
  right: 2rem;
  background: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  font-size: 0.875rem;
  font-weight: 600;
}

.pricing-header {
  padding: 2rem;
  text-align: center;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
}

.pricing-header h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
}

.price .amount {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
}

.price .period {
  font-size: 1rem;
  opacity: 0.8;
}

.pricing-features {
  padding: 2rem;
}

.pricing-features ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.pricing-features li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: var(--dark-color);
}

.pricing-features i.fa-check {
  color: var(--success-color);
}

.pricing-features i.fa-times {
  color: var(--danger-color);
}

.pricing-footer {
  padding: 0 2rem 2rem;
}

/* Testimonials */
.testimonials-section {
  padding: 6rem 0;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--lighter-gray);
  transition: transform 0.3s;
}

.testimonial-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.testimonial-content {
  margin-bottom: 2rem;
  font-style: italic;
  color: var(--dark-color);
  line-height: 1.6;
  position: relative;
}

.testimonial-content::before {
  content: '"';
  font-size: 4rem;
  color: var(--primary-color);
  opacity: 0.2;
  position: absolute;
  top: -1rem;
  left: -0.5rem;
  font-family: serif;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.testimonial-author img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.author-info h4 {
  margin-bottom: 0.25rem;
  font-size: 1rem;
}

.author-info span {
  color: var(--gray-color);
  font-size: 0.875rem;
}

/* CTA Section */
.cta-section {
  padding: 6rem 0;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  text-align: center;
}

.cta-content h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.cta-content p {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Footer */
.footer {
  background: var(--dark-color);
  color: white;
  padding: 4rem 0 2rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-logo {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: white;
  font-family: var(--font-secondary);
}

.footer-section p {
  opacity: 0.8;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-decoration: none;
  transition: background 0.3s;
}

.social-link:hover {
  background: var(--primary-color);
}

.footer-section h4 {
  color: white;
  margin-bottom: 1.5rem;
  font-size: 1.125rem;
}

.footer-section ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer-section li {
  margin-bottom: 0.75rem;
}

.footer-section a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: white;
}

.contact-info li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.contact-info i {
  margin-top: 0.25rem;
  color: var(--primary-color);
}

.footer-bottom {
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-bottom p {
  opacity: 0.6;
  margin: 0;
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.875rem;
}

.footer-links a:hover {
  color: white;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .hero-title {
    font-size: 2.75rem;
  }
  
  .pricing-card.popular {
    transform: none;
  }
}

@media (max-width: 768px) {
  .navbar-menu,
  .navbar-actions {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .hero-title {
    font-size: 2.25rem;
  }
  
  .hero-actions {
    flex-direction: column;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .cta-actions {
    flex-direction: column;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .footer-links {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 6rem 0 3rem;
  }
  
  .hero-title {
    font-size: 1.875rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .courses-grid,
  .pricing-grid,
  .testimonials-grid {
    grid-template-columns: 1fr;
  }
}
</style>