import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAssignmentStore = defineStore('assignments', () => {
  // État
  const assignments = ref([])
  const teacherAssignments = ref([])
  const pendingAssignments = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const getAssignmentById = (id) => {
    return assignments.value.find(a => a._id === id)
  }

  const pendingCount = computed(() => {
    const now = new Date()
    return assignments.value.filter(a => {
      const dueDate = new Date(a.dueDate)
      return dueDate > now && !a.submission
    }).length
  })

  // Actions
  const fetchStudentAssignments = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      assignments.value = [
        {
          _id: '1',
          title: 'Projet Final - Site E-commerce',
          description: 'Créez un site e-commerce complet avec Vue.js et Node.js',
          course: { _id: '1', title: 'JavaScript Avancé' },
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          totalPoints: 100,
          submission: null
        },
        {
          _id: '2',
          title: 'Application Todo List',
          description: 'Développez une application Todo List avec React Native',
          course: { _id: '2', title: 'React Native Mobile' },
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          totalPoints: 50,
          submission: null
        },
        {
          _id: '3',
          title: 'Analyse de données avec Python',
          description: 'Analysez un jeu de données réel avec Pandas',
          course: { _id: '3', title: 'Machine Learning Basics' },
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          totalPoints: 75,
          submission: {
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            grade: 85
          }
        }
      ]
      
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const fetchTeacherAssignments = async () => {
    isLoading.value = true
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      teacherAssignments.value = [
        {
          _id: '1',
          title: 'Projet Final - Site E-commerce',
          course: 'JavaScript Avancé',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          submitted: 42,
          total: 524,
          graded: 15,
          averageGrade: 16.5
        },
        {
          _id: '2',
          title: 'Application Todo List',
          course: 'React Native Mobile',
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          submitted: 28,
          total: 312,
          graded: 8,
          averageGrade: 15.8
        }
      ]
      
      pendingAssignments.value = teacherAssignments.value.filter(a => a.submitted > a.graded)
      
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const submitAssignment = async (assignmentId, submissionData) => {
    isLoading.value = true
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const assignment = assignments.value.find(a => a._id === assignmentId)
      if (assignment) {
        assignment.submission = {
          submittedAt: new Date(),
          ...submissionData
        }
      }
      
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  const gradeAssignment = async (assignmentId, studentId, grade) => {
    isLoading.value = true
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  return {
    assignments,
    teacherAssignments,
    pendingAssignments,
    isLoading,
    error,
    pendingCount,
    getAssignmentById,
    fetchStudentAssignments,
    fetchTeacherAssignments,
    submitAssignment,
    gradeAssignment
  }
})