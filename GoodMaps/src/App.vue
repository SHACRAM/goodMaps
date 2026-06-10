<template>
  <div class="app-shell">
    <RouterView v-slot="{ Component, route }">
      <Transition :name="route.meta.transition || 'fade'" mode="out-in">
        <component :is="Component" :key="route.name" />
      </Transition>
    </RouterView>
    <Toast position="top-center" />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import Toast from 'primevue/toast'
import { useI18n } from 'vue-i18n'
import { usePreferencesStore } from '@/stores/preferences'
import { watch } from 'vue'

const { locale } = useI18n()
const prefs = usePreferencesStore()

// Sync i18n locale with preferences
watch(() => prefs.language, (lang) => {
  locale.value = lang
}, { immediate: true })

// Listen for system theme changes
if (prefs.theme === 'system') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    prefs.applyTheme()
  })
}
</script>

<style scoped>
.app-shell {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
}
</style>
