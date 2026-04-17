import { defineStore } from 'pinia'
import { ref, computed } from 'vue'


export const useCourseStore = defineStore('courses', () => {
  // État
  const enrolledCourses = ref([])
  const allCourses = ref([])
  const recommendedCourses = ref([])
  const teacherCourses = ref([])
  const teacherStudents = ref(0)
  const totalRevenue = ref(0)
  const isLoading = ref(false)


  // Getters
  const getCourseById = (id) => {
    return allCourses.value.find(course => course._id === id)
  }

  const getEnrolledCourseById = (id) => {
    return enrolledCourses.value.find(course => course._id === id)
  }

  // Actions
  const fetchEnrolledCourses = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      // Simulation de données (à remplacer par API réelle)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      enrolledCourses.value = [
        {
          _id: '1',
          title: 'JavaScript Avancé',
          subject: 'Programmation',
          level: 'Avancé',
          progress: 65,
          thumbnail: '/images/course1.jpg',
          teacher: { firstName: 'Jean', lastName: 'Dupont' }
        },
        {
          _id: '2',
          title: 'React Native Mobile',
          subject: 'Mobile',
          level: 'Intermédiaire',
          progress: 40,
          thumbnail: '/images/course2.jpg',
          teacher: { firstName: 'Sarah', lastName: 'Martin' }
        },
        {
          _id: '3',
          title: 'Machine Learning Basics',
          subject: 'Data Science',
          level: 'Débutant',
          progress: 20,
          thumbnail: '/images/course3.jpg',
          teacher: { firstName: 'Robert', lastName: 'Durand' }
        }
      ]
      
      teacherStudents.value = 1247
      totalRevenue.value = 42580
      
    } catch (err) {
      error.value = err.message
      console.error('Erreur fetchEnrolledCourses:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchTeacherCourses = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      teacherCourses.value = [
        {
          _id: '1',
          title: 'JavaScript Avancé',
          description: 'Maîtrisez JavaScript moderne avec ES6+',
          students: 524,
          rating: 4.8,
          revenue: 12580,
          avgProgress: 68,
          status: 'published',
          thumbnail: '/images/course1.jpg'
        },
        {
          _id: '2',
          title: 'React Native Mobile',
          description: 'Créez des applications mobiles avec React Native',
          students: 312,
          rating: 4.9,
          revenue: 9340,
          avgProgress: 72,
          status: 'published',
          thumbnail: '/images/course2.jpg'
        }
      ]
      
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const fetchAllCourses = async () => {
    isLoading.value = true
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      allCourses.value = [
        {
          _id: '1',
          title: 'JavaScript Avancé',
          subject: 'Programmation',
          level: 'Avancé',
          price: 15000,
          discount: 20,
          duration: { value: 3, unit: 'months' },
          currentStudents: 524,
          averageRating: 4.8,
          thumbnail: '/images/course1.jpg',
          description: 'Maîtrisez JavaScript moderne avec ES6+'
        },
        {
          _id: '2',
          title: 'React Native Mobile',
          subject: 'Mobile',
          level: 'Intermédiaire',
          price: 18000,
          discount: 15,
          duration: { value: 4, unit: 'months' },
          currentStudents: 312,
          averageRating: 4.9,
          thumbnail: '/images/course2.jpg',
          description: 'Créez des applications mobiles professionnelles'
        },
        {
          _id: '3',
          title: 'Machine Learning Basics',
          subject: 'Data Science',
          level: 'Débutant',
          price: 20000,
          discount: 10,
          duration: { value: 5, unit: 'months' },
          currentStudents: 245,
          averageRating: 4.7,
          thumbnail: '/images/course3.jpg',
          description: 'Introduction au Machine Learning'
        }
      ]
      
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const fetchRecommendedCourses = async () => {
    isLoading.value = true
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      recommendedCourses.value = [
        {
          _id: 'rec1',
          title: 'Advanced Mathematics',
          subject: 'Mathematics',
          level: 'Advanced Level',
          description: 'Master advanced mathematical concepts',
          thumbnail: '/images/math-course.jpg',
          price: 15000,
          discount: 20,
          duration: { value: 3, unit: 'months' },
          currentStudents: 245,
          averageRating: 4.7
        },
        {
          _id: 'rec2',
          title: 'Physics Fundamentals',
          subject: 'Physics',
          level: 'Ordinary Level',
          description: 'Learn fundamental physics principles',
          thumbnail: '/images/physics-course.jpg',
          price: 12000,
          discount: 10,
          duration: { value: 2, unit: 'months' },
          currentStudents: 189,
          averageRating: 4.5
        }
      ]
      
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const enrollCourse = async (courseId) => {
    isLoading.value = true
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const course = allCourses.value.find(c => c._id === courseId)
      if (course && !enrolledCourses.value.find(c => c._id === courseId)) {
        enrolledCourses.value.push({
          ...course,
          progress: 0,
          enrolledAt: new Date()
        })
      }
      
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  const updateCourseProgress = async (courseId, progress) => {
    const course = enrolledCourses.value.find(c => c._id === courseId)
    if (course) {
      course.progress = progress
    }
  }

  return {
    // État
    enrolledCourses,
    allCourses,
    recommendedCourses,
    teacherCourses,
    teacherStudents,
    totalRevenue,
    isLoading,
    error,
    // Getters
    getCourseById,
    getEnrolledCourseById,
    // Actions
    fetchEnrolledCourses,
    fetchTeacherCourses,
    fetchAllCourses,
    fetchRecommendedCourses,
    enrollCourse,
    updateCourseProgress
  }
})