<template>
  <div class="password-strength">
    <div class="strength-bar">
      <div
        class="strength-bar-fill"
        :class="strengthClass"
        :style="{ width: strengthPercent + '%' }"
      ></div>
    </div>

    <p class="strength-text" :class="strengthClass">
      {{ strengthLabel }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  password: {
    type: String,
    required: true
  }
})

const strengthScore = computed(() => {
  let score = 0
  if (props.password.length >= 6) score++
  if (/[A-Z]/.test(props.password)) score++
  if (/[a-z]/.test(props.password)) score++
  if (/\d/.test(props.password)) score++
  if (/[^A-Za-z0-9]/.test(props.password)) score++
  return score
})

const strengthPercent = computed(() => (strengthScore.value / 5) * 100)

const strengthLabel = computed(() => {
  if (strengthScore.value <= 1) return 'Mot de passe très faible'
  if (strengthScore.value === 2) return 'Mot de passe faible'
  if (strengthScore.value === 3) return 'Mot de passe moyen'
  if (strengthScore.value === 4) return 'Mot de passe fort'
  return 'Mot de passe très fort'
})

const strengthClass = computed(() => {
  if (strengthScore.value <= 1) return 'weak'
  if (strengthScore.value === 2) return 'low'
  if (strengthScore.value === 3) return 'medium'
  if (strengthScore.value === 4) return 'strong'
  return 'very-strong'
})
</script>

<style scoped>
.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.strength-bar-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.strength-text {
  margin-top: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Couleurs */
.weak {
  background: #e53e3e;
  color: #e53e3e;
}

.low {
  background: #ed8936;
  color: #ed8936;
}

.medium {
  background: #ecc94b;
  color: #b7791f;
}

.strong {
  background: #48bb78;
  color: #48bb78;
}

.very-strong {
  background: #38a169;
  color: #38a169;
}
</style>