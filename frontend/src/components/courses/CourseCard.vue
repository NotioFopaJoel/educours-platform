<template>
  <div class="course-card">
    <div class="course-thumbnail">
      <img :src="course.thumbnail || '/images/course-default.jpg'" :alt="course.title" />
      <div v-if="course.isFeatured" class="featured-badge">
        Populaire
      </div>
    </div>
    
    <div class="course-content">
      <div class="course-category">
        {{ course.category || 'Général' }}
      </div>
      
      <h3 class="course-title">{{ course.title }}</h3>
      
      <p class="course-description">
        {{ truncateDescription(course.description) }}
      </p>
      
      <div class="course-meta">
        <div class="meta-item">
          <i class="icon-video"></i>
          <span>{{ course.videoCount || 0 }} leçons</span>
        </div>
        <div class="meta-item">
          <i class="icon-students"></i>
          <span>{{ course.studentCount || 0 }} étudiants</span>
        </div>
      </div>
      
      <div class="course-footer">
        <div class="course-price">
          <span v-if="course.price > 0" class="price">
            {{ formatPrice(course.price) }}
          </span>
          <span v-else class="free">
            Gratuit
          </span>
        </div>
        
        <router-link 
          :to="`/courses/${course._id || course.id}`" 
          class="btn-view"
        >
          Voir le cours
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  course: {
    type: Object,
    required: true
  }
});

const truncateDescription = (text) => {
  if (!text) return '';
  if (text.length > 100) {
    return text.substring(0, 100) + '...';
  }
  return text;
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};
</script>

<style scoped>
.course-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.course-thumbnail {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.course-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featured-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #f59e0b;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.course-content {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.course-category {
  color: #4f46e5;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.course-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.course-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  flex-grow: 1;
}

.course-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-item i {
  font-size: 1rem;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.course-price .price {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.course-price .free {
  font-size: 1.25rem;
  font-weight: 600;
  color: #10b981;
}

.btn-view {
  padding: 0.5rem 1rem;
  background: #4f46e5;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-view:hover {
  background: #4338ca;
}
</style>