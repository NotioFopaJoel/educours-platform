<template>
  <div class="not-found-view">
    <div class="container">
      <div class="error-content">
        <!-- Animation/Illustration -->
        <div class="error-illustration">
          <div class="illustration-container">
            <div class="astronaut">
              <div class="helmet">
                <div class="visor"></div>
              </div>
              <div class="body">
                <div class="arm left"></div>
                <div class="arm right"></div>
              </div>
              <div class="legs">
                <div class="leg left"></div>
                <div class="leg right"></div>
              </div>
            </div>
            <div class="stars">
              <div class="star" v-for="i in 20" :key="i" :style="starStyle(i)"></div>
            </div>
            <div class="planet"></div>
            <div class="spaceship"></div>
          </div>
        </div>

        <!-- Message d'erreur -->
        <div class="error-message">
          <h1 class="error-code">404</h1>
          <h2 class="error-title">Page non trouvée</h2>
          <p class="error-description">
            Oups ! Il semble que vous vous soyez perdu dans l'espace.
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>

          <!-- Suggestions -->
          <div class="suggestions">
            <h3>Voici quelques suggestions :</h3>
            <ul class="suggestion-list">
              <li>Vérifiez l'URL pour les fautes de frappe</li>
              <li>Retournez à la page d'accueil</li>
              <li>Utilisez la recherche pour trouver ce que vous cherchez</li>
              <li>Contactez notre support si le problème persiste</li>
            </ul>
          </div>

          <!-- Actions -->
          <div class="error-actions">
            <router-link to="/" class="btn-primary">
              <i class="icon-home"></i>
              Retour à l'accueil
            </router-link>
            <router-link to="/courses" class="btn-secondary">
              <i class="icon-book"></i>
              Explorer les cours
            </router-link>
            <button class="btn-outline" @click="goBack">
              <i class="icon-arrow-left"></i>
              Page précédente
            </button>
            <button class="btn-outline" @click="contactSupport">
              <i class="icon-help-circle"></i>
              Support
            </button>
          </div>

          <!-- Recherche -->
          <div class="search-section">
            <div class="search-box">
              <i class="icon-search"></i>
              <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Rechercher un cours, une leçon..."
                  @keyup.enter="performSearch"
                  class="search-input"
              >
              <button class="btn-search" @click="performSearch">
                Rechercher
              </button>
            </div>
          </div>

          <!-- Liens rapides -->
          <div class="quick-links">
            <h3>Liens rapides</h3>
            <div class="links-grid">
              <router-link to="/dashboard" class="link-card">
                <i class="icon-layout"></i>
                <span>Tableau de bord</span>
              </router-link>
              <router-link to="/courses" class="link-card">
                <i class="icon-book"></i>
                <span>Tous les cours</span>
              </router-link>
              <router-link to="/profile" class="link-card">
                <i class="icon-user"></i>
                <span>Mon profil</span>
              </router-link>
              <router-link to="/help" class="link-card">
                <i class="icon-help-circle"></i>
                <span>Centre d'aide</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques pour rassurer -->
      <div class="reassurance">
        <div class="reassurance-card">
          <i class="icon-shield"></i>
          <div class="reassurance-content">
            <h4>Plateforme sécurisée</h4>
            <p>Vos données sont protégées avec un cryptage SSL 256 bits</p>
          </div>
        </div>
        <div class="reassurance-card">
          <i class="icon-users"></i>
          <div class="reassurance-content">
            <h4>Communauté active</h4>
            <p>Rejoignez plus de 50,000 apprenants satisfaits</p>
          </div>
        </div>
        <div class="reassurance-card">
          <i class="icon-clock"></i>
          <div class="reassurance-content">
            <h4>Support 24/7</h4>
            <p>Notre équipe est disponible à tout moment pour vous aider</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

// Style des étoiles
const starStyle = (index) => {
  const size = Math.random() * 3 + 1
  const x = Math.random() * 100
  const y = Math.random() * 100
  const opacity = Math.random() * 0.7 + 0.3
  const animationDelay = Math.random() * 5

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}%`,
    top: `${y}%`,
    opacity: opacity,
    animationDelay: `${animationDelay}s`
  }
}

// Méthodes
const goBack = () => {
  router.go(-1)
}

const contactSupport = () => {
  router.push('/help/contact')
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
}

// Animation de l'astronaute
const startAstronautAnimation = () => {
  const astronaut = document.querySelector('.astronaut')
  if (astronaut) {
    astronaut.style.animation = 'float 3s ease-in-out infinite'
  }
}

// Initialisation
onMounted(() => {
  startAstronautAnimation()

  // Suivi analytique de l'erreur 404
  console.log('404 Page visited:', window.location.pathname)
})
</script>

<style scoped>
.not-found-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.error-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  margin-bottom: 4rem;
}

@media (max-width: 992px) {
  .error-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 2rem;
  }
}

.error-illustration {
  position: relative;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.illustration-container {
  position: relative;
  width: 300px;
  height: 300px;
}

/* Astronaute */
.astronaut {
  position: absolute;
  width: 80px;
  height: 120px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translate(-50%, -50%) translateY(0);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-20px);
  }
}

.helmet {
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  overflow: hidden;
}

.visor {
  width: 40px;
  height: 25px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
}

.body {
  width: 50px;
  height: 60px;
  background: white;
  border-radius: 20px;
  position: absolute;
  top: 45px;
  left: 50%;
  transform: translateX(-50%);
}

.arm {
  width: 15px;
  height: 40px;
  background: white;
  border-radius: 7px;
  position: absolute;
  top: 50px;
}

.arm.left {
  left: -10px;
  transform: rotate(30deg);
  animation: waveLeft 2s ease-in-out infinite;
}

.arm.right {
  right: -10px;
  transform: rotate(-30deg);
  animation: waveRight 2s ease-in-out infinite;
}

@keyframes waveLeft {
  0%, 100% {
    transform: rotate(30deg);
  }
  50% {
    transform: rotate(45deg);
  }
}

@keyframes waveRight {
  0%, 100% {
    transform: rotate(-30deg);
  }
  50% {
    transform: rotate(-45deg);
  }
}

.legs {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 5px;
}

.leg {
  width: 15px;
  height: 40px;
  background: white;
  border-radius: 7px;
}

.leg.left {
  animation: kickLeft 2s ease-in-out infinite;
}

.leg.right {
  animation: kickRight 2s ease-in-out infinite;
}

@keyframes kickLeft {
  0%, 100% {
    transform: rotate(0);
  }
  50% {
    transform: rotate(15deg);
  }
}

@keyframes kickRight {
  0%, 100% {
    transform: rotate(0);
  }
  50% {
    transform: rotate(-15deg);
  }
}

/* Étoiles */
.stars {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: twinkle 2s infinite;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* Planète */
.planet {
  position: absolute;
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  top: 50%;
  left: 20%;
  transform: translateY(-50%);
  box-shadow: 0 0 40px rgba(102, 126, 234, 0.3);
}

.planet::after {
  content: '';
  position: absolute;
  width: 80px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  top: 20%;
  left: 20%;
  transform: rotate(-30deg);
}

/* Vaisseau spatial */
.spaceship {
  position: absolute;
  width: 80px;
  height: 40px;
  background: linear-gradient(135deg, #f56565 0%, #ed8936 100%);
  border-radius: 20px;
  top: 30%;
  right: 10%;
  transform: rotate(20deg);
  animation: fly 4s linear infinite;
}

.spaceship::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  top: 50%;
  left: -10px;
  transform: translateY(-50%);
}

.spaceship::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 30px;
  background: #48bb78;
  border-radius: 5px;
  top: 50%;
  right: -5px;
  transform: translateY(-50%);
}

@keyframes fly {
  0% {
    transform: rotate(20deg) translateX(0);
    opacity: 1;
  }
  100% {
    transform: rotate(20deg) translateX(100px);
    opacity: 0;
  }
}

/* Message d'erreur */
.error-message {
  max-width: 600px;
}

.error-code {
  font-size: 8rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #f56565 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;
  line-height: 1;
}

.error-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0.5rem 0 1.5rem 0;
  color: white;
}

.error-description {
  font-size: 1.1rem;
  color: #cbd5e0;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.suggestions {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.suggestions h3 {
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: white;
}

.suggestion-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestion-list li {
  padding: 0.5rem 0;
  color: #cbd5e0;
  position: relative;
  padding-left: 1.5rem;
}

.suggestion-list li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: #667eea;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn-primary, .btn-secondary, .btn-outline {
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
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-outline {
  background: transparent;
  color: #cbd5e0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.search-section {
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #cbd5e0;
}

.search-input {
  flex: 1;
  padding: 1rem 1rem 1rem 3rem;
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-input:focus {
  outline: none;
}

.btn-search {
  padding: 0 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-search:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

.quick-links {
  margin-top: 2rem;
}

.quick-links h3 {
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: white;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (max-width: 576px) {
  .links-grid {
    grid-template-columns: 1fr;
  }
}

.link-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e0;
  text-decoration: none;
  transition: all 0.2s;
}

.link-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
  transform: translateY(-2px);
}

.link-card i {
  font-size: 1.5rem;
  color: #667eea;
}

.link-card span {
  font-weight: 500;
}

/* Réassurance */
.reassurance {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 4rem;
}

@media (max-width: 768px) {
  .reassurance {
    grid-template-columns: 1fr;
  }
}

.reassurance-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.reassurance-card i {
  font-size: 2rem;
  color: #667eea;
  flex-shrink: 0;
}

.reassurance-content h4 {
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
  color: white;
}

.reassurance-content p {
  margin: 0;
  color: #cbd5e0;
  font-size: 0.9rem;
  line-height: 1.5;
}
</style>