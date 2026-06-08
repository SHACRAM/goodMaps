import { defineStore } from 'pinia'
import { ref } from 'vue'
import { placesService } from '@/services/places.service'

export const usePlacesStore = defineStore('places', () => {
  const userLocation = ref(null) // { lat, lng, city }
  const places = ref([])
  const selectedPlace = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  async function detectLocation() {
    isLoading.value = true
    error.value = null
    try {
      const coords = await placesService.getUserLocation()
      const city = await placesService.reverseGeocode(coords.lat, coords.lng)
      userLocation.value = { ...coords, city }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSuggestions({ radius, interests, pmr, pmrFilter }) {
    if (!userLocation.value) throw new Error('No location')
    isLoading.value = true
    error.value = null
    try {
      const results = await placesService.searchNearby({
        lat: userLocation.value.lat,
        lng: userLocation.value.lng,
        radius,
        interests,
        pmr,
        pmrFilter,
      })
      places.value = results
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function selectPlace(place) {
    selectedPlace.value = place
  }

  function clearError() {
    error.value = null
  }

  return {
    userLocation, places, selectedPlace, isLoading, error,
    detectLocation, fetchSuggestions, selectPlace, clearError
  }
})
