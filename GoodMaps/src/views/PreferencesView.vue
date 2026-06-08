<template>
  <div class="prefs">
    <!-- Header -->
    <header class="prefs__header">
      <button class="gm-icon-btn" @click="router.back()">
        <i class="pi pi-arrow-left" />
      </button>
      <h1 class="prefs__title">{{ t('preferences.title') }}</h1>
      <div style="width:44px" />
    </header>

    <div class="prefs__content">
      <!-- Theme -->
      <section class="prefs__section">
        <h2 class="prefs__section-title">{{ t('preferences.theme') }}</h2>
        <div class="prefs__theme-options">
          <button
            v-for="opt in themeOptions"
            :key="opt.value"
            class="prefs__theme-btn"
            :class="{ active: localTheme === opt.value }"
            @click="localTheme = opt.value"
          >
            <span class="prefs__theme-icon">{{ opt.icon }}</span>
            <span>{{ opt.label }}</span>
          </button>
        </div>
      </section>

      <!-- Language -->
      <section class="prefs__section">
        <h2 class="prefs__section-title">{{ t('preferences.language') }}</h2>
        <div class="prefs__lang-options">
          <button
            v-for="lang in langOptions"
            :key="lang.value"
            class="prefs__lang-btn"
            :class="{ active: localLang === lang.value }"
            @click="localLang = lang.value"
          >
            <span>{{ lang.flag }}</span>
            {{ lang.label }}
          </button>
        </div>
      </section>

      <!-- Search Radius -->
      <section class="prefs__section">
        <h2 class="prefs__section-title">
          {{ t('preferences.radius') }}: <span class="prefs__highlight">{{ radiusLabel }}</span>
        </h2>
        <Slider v-model="localRadius" :min="500" :max="10000" :step="500" />
        <div class="prefs__radius-marks">
          <span>500m</span><span>5km</span><span>10km</span>
        </div>
      </section>

      <!-- PMR -->
      <section class="prefs__section">
        <div class="prefs__toggle-row">
          <div>
            <h2 class="prefs__section-title">{{ t('preferences.accessibility') }}</h2>
            <p class="prefs__section-sub">Filtrer les lieux accessibles aux PMR</p>
          </div>
          <ToggleSwitch v-model="localPmr" />
        </div>
      </section>

      <!-- Interests -->
      <section class="prefs__section">
        <h2 class="prefs__section-title">{{ t('onboarding.interests') }}</h2>
        <div class="prefs__chips">
          <button
            v-for="interest in interestOptions"
            :key="interest.value"
            class="onboarding__chip"
            :class="{ active: localInterests.includes(interest.value) }"
            @click="toggleInterest(interest.value)"
          >
            <span>{{ interest.icon }}</span>
            {{ interest.label }}
          </button>
        </div>
      </section>

      <!-- About -->
      <section class="prefs__section prefs__about">
        <h2 class="prefs__section-title">{{ t('preferences.about') }}</h2>
        <div class="prefs__about-info">
          <div class="prefs__about-row">
            <span>{{ t('preferences.version') }}</span>
            <span class="prefs__muted">1.0.0</span>
          </div>
          <div class="prefs__about-row">
            <span>Données cartographiques</span>
            <a href="https://www.openstreetmap.org" target="_blank" class="prefs__link">OpenStreetMap</a>
          </div>
          <div class="prefs__about-row">
            <span>Descriptions</span>
            <a href="https://www.wikipedia.org" target="_blank" class="prefs__link">Wikipedia</a>
          </div>
          <button class="prefs__reset-btn" @click="resetOnboarding">
            Réinitialiser le profil
          </button>
        </div>
      </section>
    </div>

    <!-- Save Button -->
    <div class="prefs__footer">
      <button class="gm-btn-primary" @click="save">
        <i class="pi pi-check" />
        {{ t('preferences.save') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import Slider from 'primevue/slider'
import ToggleSwitch from 'primevue/toggleswitch'
import { usePreferencesStore } from '@/stores/preferences'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()
const prefs = usePreferencesStore()

// Local copies for editing
const localTheme = ref(prefs.theme)
const localLang = ref(prefs.language)
const localRadius = ref(prefs.radius)
const localPmr = ref(prefs.pmr)
const localInterests = ref([...prefs.interests])

const themeOptions = computed(() => [
  { value: 'light',  icon: '☀️',  label: t('preferences.light') },
  { value: 'dark',   icon: '🌙',  label: t('preferences.dark') },
  { value: 'system', icon: '⚙️',  label: t('preferences.system') },
])

const langOptions = [
  { value: 'fr', flag: '🇫🇷', label: 'Français' },
  { value: 'en', flag: '🇬🇧', label: 'English' },
]

const interestOptions = computed(() => [
  { value: 'culture',   icon: '🎭', label: t('onboarding.interests_options.culture') },
  { value: 'nature',    icon: '🌿', label: t('onboarding.interests_options.nature') },
  { value: 'food',      icon: '🍽️', label: t('onboarding.interests_options.food') },
  { value: 'sport',     icon: '⚽', label: t('onboarding.interests_options.sport') },
  { value: 'shopping',  icon: '🛍️', label: t('onboarding.interests_options.shopping') },
  { value: 'nightlife', icon: '🌙', label: t('onboarding.interests_options.nightlife') },
])

const radiusLabel = computed(() => {
  return localRadius.value >= 1000
    ? `${(localRadius.value / 1000).toFixed(1)} km`
    : `${localRadius.value} m`
})

function toggleInterest(val) {
  const idx = localInterests.value.indexOf(val)
  if (idx === -1) localInterests.value.push(val)
  else localInterests.value.splice(idx, 1)
}

function save() {
  prefs.setTheme(localTheme.value)
  prefs.setLanguage(localLang.value)
  prefs.setRadius(localRadius.value)
  prefs.setPmr(localPmr.value)
  prefs.setInterests(localInterests.value)

  toast.add({
    severity: 'success',
    summary: 'Enregistré',
    detail: 'Vos préférences ont été sauvegardées',
    life: 2000
  })
  setTimeout(() => router.back(), 500)
}

function resetOnboarding() {
  prefs.resetOnboarding()
  router.replace({ name: 'onboarding' })
}
</script>

<style scoped>
.prefs {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
}

.prefs__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: max(12px, var(--safe-top));
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.prefs__title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 900;
}

.prefs__content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.prefs__section {
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: 16px;
}

.prefs__section-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
}

.prefs__section-sub {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: -8px;
  margin-bottom: 0;
}

.prefs__highlight {
  color: var(--gm-red);
}

.prefs__theme-options {
  display: flex;
  gap: 8px;
}

.prefs__theme-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-primary);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);

  &.active {
    border-color: var(--gm-red);
    background: rgba(232, 64, 64, 0.06);
    color: var(--gm-red);
  }
}

.prefs__theme-icon { font-size: 22px; }

.prefs__lang-options {
  display: flex;
  gap: 8px;
}

.prefs__lang-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-primary);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);

  &.active {
    border-color: var(--gm-red);
    background: rgba(232, 64, 64, 0.06);
    color: var(--gm-red);
  }
}

.prefs__radius-marks {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 6px;
}

.prefs__toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  .prefs__section-title { margin-bottom: 2px; }
}

.prefs__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.onboarding__chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all var(--transition-fast);

  &.active {
    border-color: var(--gm-red);
    background: rgba(232, 64, 64, 0.08);
    color: var(--gm-red);
  }
}

.prefs__about-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.prefs__about-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.prefs__muted { color: var(--text-muted); }

.prefs__link {
  color: var(--gm-red);
  text-decoration: none;
  font-weight: 600;
}

.prefs__reset-btn {
  margin-top: 8px;
  background: none;
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-full);
  padding: 8px 16px;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  align-self: flex-start;

  &:hover { border-color: var(--gm-red); color: var(--gm-red); }
}

.prefs__footer {
  padding: 16px;
  padding-bottom: max(16px, var(--safe-bottom));
  background: var(--bg-surface);
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

:deep(.p-slider) {
  .p-slider-range { background: var(--gm-red) !important; }
  .p-slider-handle { border-color: var(--gm-red) !important; background: var(--gm-red) !important; }
}

:deep(.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider) {
  background: var(--gm-red) !important;
}
</style>
