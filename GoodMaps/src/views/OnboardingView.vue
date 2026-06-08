<template>
  <div class="onboarding">
    <div class="onboarding__card gm-card">
      <!-- Header -->
      <div class="onboarding__header">
        <GmLogo :size="40" />
        <button class="onboarding__close gm-icon-btn" @click="skip" aria-label="Fermer">
          <i class="pi pi-times" />
        </button>
      </div>

      <h2 class="onboarding__title">{{ t('onboarding.title') }}</h2>
      <p class="onboarding__subtitle">{{ t('onboarding.subtitle') }}</p>

      <div class="onboarding__form">
        <!-- PMR Toggle -->
        <div class="onboarding__field">
          <label class="onboarding__label">
            <i class="pi pi-wheelchair" />
            {{ t('onboarding.mobility') }}
          </label>
          <div class="onboarding__toggle-row">
            <ToggleSwitch v-model="form.pmr" />
          </div>
        </div>

        <!-- Interests -->
        <div class="onboarding__field">
          <label class="onboarding__label">
            <i class="pi pi-star" />
            {{ t('onboarding.interests') }}
          </label>
          <div class="onboarding__chips">
            <button
              v-for="interest in interestOptions"
              :key="interest.value"
              class="onboarding__chip"
              :class="{ active: form.interests.includes(interest.value) }"
              @click="toggleInterest(interest.value)"
            >
              <span>{{ interest.icon }}</span>
              {{ interest.label }}
            </button>
          </div>
        </div>

        <!-- Age group -->
        <div class="onboarding__field">
          <label class="onboarding__label">
            <i class="pi pi-users" />
            {{ t('onboarding.ageGroup') }}
          </label>
          <div class="onboarding__chips">
            <button
              v-for="age in ageOptions"
              :key="age.value"
              class="onboarding__chip"
              :class="{ active: form.ageGroup === age.value }"
              @click="form.ageGroup = age.value"
            >
              {{ age.label }}
            </button>
          </div>
        </div>

        <!-- Search radius -->
        <div class="onboarding__field">
          <label class="onboarding__label">
            <i class="pi pi-map" />
            {{ t('onboarding.radius') }}: <strong>{{ radiusLabel }}</strong>
          </label>
          <Slider v-model="form.radius" :min="500" :max="10000" :step="500" class="onboarding__slider" />
        </div>

        <!-- Language -->
        <div class="onboarding__field">
          <label class="onboarding__label">
            <i class="pi pi-globe" />
            {{ t('onboarding.language') }}
          </label>
          <Select
            v-model="form.language"
            :options="langOptions"
            optionLabel="label"
            optionValue="value"
            class="onboarding__select"
          />
        </div>
      </div>

      <button class="gm-btn-primary onboarding__submit" @click="submit">
        {{ t('onboarding.submit') }}
        <i class="pi pi-arrow-right" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePreferencesStore } from '@/stores/preferences'
import ToggleSwitch from 'primevue/toggleswitch'
import Slider from 'primevue/slider'
import Select from 'primevue/select'
import GmLogo from '@/components/GmLogo.vue'

const { t } = useI18n()
const router = useRouter()
const prefs = usePreferencesStore()

const form = reactive({
  pmr: prefs.pmr,
  interests: [...prefs.interests],
  ageGroup: prefs.ageGroup,
  radius: prefs.radius,
  language: prefs.language
})

const interestOptions = computed(() => [
  { value: 'culture',   icon: '🎭', label: t('onboarding.interests_options.culture') },
  { value: 'nature',    icon: '🌿', label: t('onboarding.interests_options.nature') },
  { value: 'food',      icon: '🍽️', label: t('onboarding.interests_options.food') },
  { value: 'sport',     icon: '⚽', label: t('onboarding.interests_options.sport') },
  { value: 'shopping',  icon: '🛍️', label: t('onboarding.interests_options.shopping') },
  { value: 'nightlife', icon: '🌙', label: t('onboarding.interests_options.nightlife') },
])

const ageOptions = computed(() => [
  { value: 'child',  label: t('onboarding.age_options.child') },
  { value: 'teen',   label: t('onboarding.age_options.teen') },
  { value: 'adult',  label: t('onboarding.age_options.adult') },
  { value: 'senior', label: t('onboarding.age_options.senior') },
])

const langOptions = [
  { label: 'Français', value: 'fr' },
  { label: 'English',  value: 'en' },
]

const radiusLabel = computed(() => {
  return form.radius >= 1000
    ? `${(form.radius / 1000).toFixed(1)} km`
    : `${form.radius} m`
})

function toggleInterest(val) {
  const idx = form.interests.indexOf(val)
  if (idx === -1) form.interests.push(val)
  else form.interests.splice(idx, 1)
}

function submit() {
  prefs.setPmr(form.pmr)
  prefs.setInterests(form.interests)
  prefs.setAgeGroup(form.ageGroup)
  prefs.setRadius(form.radius)
  prefs.setLanguage(form.language)
  prefs.completeOnboarding()
  router.push({ name: 'map' })
}

function skip() {
  prefs.completeOnboarding()
  router.push({ name: 'map' })
}
</script>

<style scoped>
.onboarding {
  height: 100%;
  width: 100%;
  background: var(--bg-primary);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
}

.onboarding__card {
  width: 100%;
  max-width: 480px;
  max-height: 92vh;
  overflow-y: auto;
  padding: 24px 20px 32px;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.onboarding__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.onboarding__close {
  width: 36px;
  height: 36px;
  background: var(--bg-primary);
  box-shadow: none;
  font-size: 14px;
  color: var(--text-muted);
}

.onboarding__title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.onboarding__subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 24px;
}

.onboarding__form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 28px;
}

.onboarding__field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.onboarding__label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 6px;

  i { color: var(--gm-red); font-size: 14px; }
  strong { color: var(--gm-red); }
}

.onboarding__toggle-row {
  display: flex;
  align-items: center;
}

.onboarding__chips {
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

.onboarding__slider {
  width: 100%;
}

.onboarding__select {
  width: 100%;
}

:deep(.p-slider) {
  .p-slider-range { background: var(--gm-red) !important; }
  .p-slider-handle { border-color: var(--gm-red) !important; background: var(--gm-red) !important; }
}

:deep(.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider) {
  background: var(--gm-red) !important;
}

:deep(.p-select) {
  border-color: var(--border-color) !important;
  background: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}
</style>
