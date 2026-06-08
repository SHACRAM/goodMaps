<template>
  <div class="splash">
    <div class="splash__content">
      <div class="splash__logo" :class="{ visible: logoVisible }">
        <GmLogo :size="88" />
      </div>
      <div class="splash__text" :class="{ visible: textVisible }">
        <span class="splash__wordmark">
          <span class="splash__word--good">GOOD</span>
          <span class="splash__word--maps">MAPS</span>
        </span>
        <p class="splash__tagline">{{ t('app.tagline') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePreferencesStore } from '@/stores/preferences'
import GmLogo from '@/components/GmLogo.vue'

const { t } = useI18n()
const router = useRouter()
const prefs = usePreferencesStore()

const logoVisible = ref(false)
const textVisible = ref(false)

onMounted(() => {
  setTimeout(() => logoVisible.value = true, 100)
  setTimeout(() => textVisible.value = true, 400)
  setTimeout(() => {
    if (prefs.onboardingDone) {
      router.replace({ name: 'map' })
    } else {
      router.replace({ name: 'onboarding' })
    }
  }, 2200)
})
</script>

<style scoped>
.splash {
  height: 100%;
  width: 100%;
  background: var(--bg-surface);
  display: flex;
  align-items: center;
  justify-content: center;
}

.splash__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.splash__logo {
  opacity: 0;
  transform: scale(0.6);
  transition: opacity 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);

  &.visible {
    opacity: 1;
    transform: scale(1);
  }
}

.splash__text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.5s ease, transform 0.5s ease;

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }
}

.splash__wordmark {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 900;
  letter-spacing: 2px;
  display: flex;
  gap: 8px;
}

.splash__word--good {
  color: var(--text-primary);
}

.splash__word--maps {
  color: var(--gm-red);
}

.splash__tagline {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-muted);
}
</style>
