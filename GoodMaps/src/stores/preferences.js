import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const usePreferencesStore = defineStore('preferences', () => {
  const theme = ref(localStorage.getItem('gm_theme') || 'light')
  const language = ref(localStorage.getItem('gm_lang') || 'fr')
  const radius = ref(Number(localStorage.getItem('gm_radius')) || 2000)
  const pmr = ref(localStorage.getItem('gm_pmr') === 'true')
  const interests = ref(JSON.parse(localStorage.getItem('gm_interests') || '[]'))
  const ageGroup = ref(localStorage.getItem('gm_age') || 'adult')
  const onboardingDone = ref(localStorage.getItem('gm_onboarded') === 'true')

  function applyTheme() {
    const root = document.documentElement
    if (theme.value === 'dark') {
      root.setAttribute('data-theme', 'dark')
    } else if (theme.value === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    } else {
      root.setAttribute('data-theme', 'light')
    }
  }

  function setTheme(val) {
    theme.value = val
    localStorage.setItem('gm_theme', val)
    applyTheme()
  }

  function setLanguage(val) {
    language.value = val
    localStorage.setItem('gm_lang', val)
  }

  function setRadius(val) {
    radius.value = val
    localStorage.setItem('gm_radius', String(val))
  }

  function setPmr(val) {
    pmr.value = val
    localStorage.setItem('gm_pmr', String(val))
  }

  function setInterests(val) {
    interests.value = val
    localStorage.setItem('gm_interests', JSON.stringify(val))
  }

  function setAgeGroup(val) {
    ageGroup.value = val
    localStorage.setItem('gm_age', val)
  }

  function completeOnboarding() {
    onboardingDone.value = true
    localStorage.setItem('gm_onboarded', 'true')
  }

  function resetOnboarding() {
    onboardingDone.value = false
    localStorage.removeItem('gm_onboarded')
  }

  return {
    theme, language, radius, pmr, interests, ageGroup, onboardingDone,
    applyTheme, setTheme, setLanguage, setRadius, setPmr,
    setInterests, setAgeGroup, completeOnboarding, resetOnboarding
  }
})
