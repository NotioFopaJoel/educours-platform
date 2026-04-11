import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLiveClassStore = defineStore('liveClasses', () => {
  // État
  const upcomingClasses = ref([])
  const pastClasses = ref([])
  const currentClass = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Actions
  const fetchUpcomingClasses = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      upcomingClasses.value = [
        {
          _id: '1',
          title: 'Les Promises en JavaScript',
          description: 'Apprenez à maîtriser les Promises et async/await',
          course: { _id: '1', title: 'JavaScript Avancé' },
          teacher: { _id: 't1', firstName: 'Jean', lastName: 'Dupont' },
          startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
          duration: 90,
          meetingId: 'meet-001',
          meetingLink: 'https://meet.google.com/xxx',
          capacity: 50,
          registered: 45
        },
        {
          _id: '2',
          title: 'Navigation dans React Native',
          description: 'Maîtrisez la navigation avec React Navigation',
          course: { _id: '2', title: 'React Native Mobile' },
          teacher: { _id: 't2', firstName: 'Sarah', lastName: 'Martin' },
          startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
          duration: 60,
          meetingId: 'meet-002',
          meetingLink: 'https://meet.google.com/yyy',
          capacity: 40,
          registered: 28
        }
      ]
      
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const fetchPastClasses = async () => {
    isLoading.value = true
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      pastClasses.value = [
        {
          _id: 'p1',
          title: 'Introduction à React',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          recording: '/recordings/class1.mp4'
        }
      ]
      
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const joinLiveClass = async (meetingId) => {
    isLoading.value = true
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const liveClass = upcomingClasses.value.find(c => c.meetingId === meetingId)
      if (liveClass) {
        currentClass.value = liveClass
        window.open(liveClass.meetingLink, '_blank')
      }
      
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  const scheduleLiveClass = async (classData) => {
    isLoading.value = true
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newClass = {
        _id: Date.now().toString(),
        ...classData,
        registered: 0,
        meetingId: `meet-${Date.now()}`
      }
      
      upcomingClasses.value.push(newClass)
      return { success: true, data: newClass }
      
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  return {
    upcomingClasses,
    pastClasses,
    currentClass,
    isLoading,
    error,
    fetchUpcomingClasses,
    fetchPastClasses,
    joinLiveClass,
    scheduleLiveClass
  }
})