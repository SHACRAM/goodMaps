import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import DialogService from 'primevue/dialogservice'
import 'primeicons/primeicons.css'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { usePreferencesStore } from './stores/preferences'

import './assets/styles/main.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(PrimeVue, {
  ripple: true,
  unstyled: false,
})
app.use(ToastService)
app.use(DialogService)

// Apply saved theme before mount
const prefs = usePreferencesStore()
prefs.applyTheme()

app.mount('#app')
