import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFavoritesStore = defineStore('favorites', () => {
  const _favorites = ref(JSON.parse(localStorage.getItem('gm_favorites') || '[]'))

  function persist() {
    localStorage.setItem('gm_favorites', JSON.stringify(_favorites.value))
  }

  function toggle(place) {
    const idx = _favorites.value.findIndex(f => f.id === place.id)
    if (idx === -1) {
      _favorites.value.unshift({ ...place, savedAt: Date.now() })
    } else {
      _favorites.value.splice(idx, 1)
    }
    persist()
  }

  function isFavorite(placeId) {
    return _favorites.value.some(f => f.id === placeId)
  }

  const favorites = computed(() => _favorites.value)
  const count = computed(() => _favorites.value.length)

  function clear() {
    _favorites.value = []
    persist()
  }

  return { favorites, count, toggle, isFavorite, clear }
})
