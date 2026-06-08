<template>
  <div class="place-detail">
    <!-- Header bar -->
    <header class="place-detail__header">
      <button class="gm-icon-btn" @click="router.back()">
        <i class="pi pi-arrow-left" />
      </button>
      <h1 class="place-detail__title">{{ place?.name || '...' }}</h1>
      <button class="gm-icon-btn" @click="favsStore.toggle(place)" aria-label="Favoris">
        <i :class="[favsStore.isFavorite(place?.id) ? 'pi pi-heart-fill' : 'pi pi-heart']" :style="favsStore.isFavorite(place?.id) ? {color: 'var(--gm-red)'} : {}" />
      </button>
      <button class="gm-icon-btn" @click="sharePlace" aria-label="Partager">
        <i class="pi pi-share-alt" />
      </button>
    </header>

    <div class="place-detail__content" v-if="place">
      <!-- Map mini view -->
      <div class="place-detail__map-wrap">
        <LMap
          v-if="mapReady"
          :zoom="16"
          :center="[place.lat, place.lng]"
          :use-global-leaflet="false"
          :zoom-control="false"
          class="place-detail__map"
          @click="openInMaps"
        >
          <LTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution=""
          />
          <LMarker :lat-lng="[place.lat, place.lng]">
            <LIcon :icon-url="markerIcon" :icon-size="[32, 40]" :icon-anchor="[16, 40]" />
          </LMarker>
        </LMap>
        <button class="place-detail__directions-btn gm-btn-secondary" @click="openInMaps">
          <i class="pi pi-directions" />
          {{ t('place.directions') }}
        </button>
      </div>

      <!-- Info section -->
      <div class="place-detail__info">
        <!-- Status badge -->
        <div class="place-detail__status-row">
          <span v-if="place.isOpen === true" class="gm-tag gm-tag--green">
            <i class="pi pi-circle-fill" style="font-size:8px" /> {{ t('map.openNow') }}
          </span>
          <span v-else-if="place.isOpen === false" class="gm-tag gm-tag--grey">
            {{ t('map.closedNow') }}
          </span>
          <span v-if="place.pmrAccess" class="gm-tag">♿ {{ t('place.accessibility') }}</span>
        </div>

        <h2 class="place-detail__name">{{ place.name }}</h2>

        <p v-if="place.address" class="place-detail__address">
          <i class="pi pi-map-marker" style="color: var(--gm-red)" />
          {{ place.address }}
        </p>

        <!-- Opening hours -->
        <div v-if="place.openingHours" class="place-detail__row">
          <i class="pi pi-clock" style="color:var(--gm-red)" />
          <span>{{ place.openingHours }}</span>
        </div>

        <!-- Phone -->
        <div v-if="place.phone" class="place-detail__row">
          <i class="pi pi-phone" style="color:var(--gm-red)" />
          <a :href="`tel:${place.phone}`" class="place-detail__link">{{ place.phone }}</a>
        </div>

        <!-- Website -->
        <div v-if="place.website" class="place-detail__row">
          <i class="pi pi-globe" style="color:var(--gm-red)" />
          <a :href="place.website" target="_blank" class="place-detail__link">{{ place.website }}</a>
        </div>

        <!-- Wikipedia description -->
        <div class="place-detail__section">
          <h3 class="place-detail__section-title">
            <i class="pi pi-info-circle" style="color:var(--gm-red)" />
            {{ t('place.description') }}
          </h3>
          <div v-if="loadingDesc" class="place-detail__desc-loading">
            <div class="gm-spinner" />
          </div>
          <p v-else-if="description" class="place-detail__description">
            {{ description }}
          </p>
          <p v-else class="place-detail__no-desc">
            Aucune description disponible pour ce lieu.
          </p>
        </div>

        <!-- Disclaimer -->
        <p class="place-detail__disclaimer">{{ t('disclaimer') }}</p>
      </div>

      <!-- Action buttons -->
      <div class="place-detail__actions">
        <button
          v-if="place.website"
          class="place-detail__action-btn"
          @click="openWebsite"
        >
          <div class="place-detail__action-icon">
            <i class="pi pi-plus" />
          </div>
          <span>{{ t('place.bookOnline') }}</span>
        </button>

        <button
          v-if="place.phone"
          class="place-detail__action-btn"
          @click="callPlace"
        >
          <div class="place-detail__action-icon">
            <i class="pi pi-play" />
          </div>
          <span>{{ t('place.callNow') }}</span>
        </button>

        <button class="place-detail__action-btn" @click="openInMaps">
          <div class="place-detail__action-icon">
            <i class="pi pi-directions" />
          </div>
          <span>{{ t('place.directions') }}</span>
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else class="place-detail__loading">
      <div class="gm-spinner" style="width:36px;height:36px;border-width:4px" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { LMap, LTileLayer, LMarker, LIcon } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import { useFavoritesStore } from '@/stores/favorites'
import { usePlacesStore } from '@/stores/places'
import { placesService } from '@/services/places.service'
import { usePreferencesStore } from '@/stores/preferences'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const toast = useToast()
const placesStore = usePlacesStore()
const prefs = usePreferencesStore()
const favsStore = useFavoritesStore()

const place = computed(() => placesStore.selectedPlace)
const description = ref(null)
const loadingDesc = ref(false)
const mapReady = ref(true)

const markerIcon = computed(() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40">
    <path d="M16 0C7.16 0 0 7.16 0 16C0 27 16 40 16 40C16 40 32 27 32 16C32 7.16 24.84 0 16 0Z" fill="#E84040"/>
    <circle cx="16" cy="16" r="7" fill="white"/>
  </svg>`
  return 'data:image/svg+xml;base64,' + btoa(svg)
})

onMounted(async () => {
  if (!place.value) {
    router.replace({ name: 'map' })
    return
  }
  // Fetch Wikipedia description
  loadingDesc.value = true
  try {
    const lang = prefs.language === 'fr' ? 'fr' : 'en'
    description.value = await placesService.getWikipediaDescription(place.value.name, lang)
  } catch {
    description.value = null
  } finally {
    loadingDesc.value = false
  }
})

function openInMaps() {
  if (!place.value) return
  const url = `https://www.google.com/maps/dir/?api=1&destination=${place.value.lat},${place.value.lng}`
  window.open(url, '_blank')
}

function openWebsite() {
  if (place.value?.website) window.open(place.value.website, '_blank')
}

function callPlace() {
  if (place.value?.phone) window.location.href = `tel:${place.value.phone}`
}

async function sharePlace() {
  if (!place.value) return
  const shareData = {
    title: place.value.name,
    text: `Découvrez ${place.value.name} sur Good Maps`,
    url: `https://www.openstreetmap.org/node/${place.value.id}`
  }
  try {
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(shareData.url)
      toast.add({ severity: 'success', summary: 'Copié', detail: 'Lien copié dans le presse-papiers', life: 2000 })
    }
  } catch {}
}
</script>

<style scoped>
.place-detail {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
}

.place-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  padding-top: max(12px, var(--safe-top));
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
  z-index: 10;
  flex-shrink: 0;
}

.place-detail__title {
  flex: 1;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 900;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.place-detail__content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.place-detail__map-wrap {
  position: relative;
  height: 220px;
  flex-shrink: 0;
}

.place-detail__map {
  height: 100%;
  width: 100%;
}

.place-detail__directions-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  padding: 8px 16px;
  font-size: 13px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-md);
}

.place-detail__info {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.place-detail__status-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.place-detail__name {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 900;
  line-height: 1.1;
}

.place-detail__address {
  font-size: 14px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.place-detail__row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);

  i { flex-shrink: 0; margin-top: 2px; }
}

.place-detail__link {
  color: var(--gm-red);
  text-decoration: none;
  word-break: break-all;

  &:hover { text-decoration: underline; }
}

.place-detail__section {
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: 16px;
}

.place-detail__section-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.place-detail__desc-loading {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.place-detail__description {
  font-size: 14px;
  line-height: 1.65;
  color: var(--text-secondary);
}

.place-detail__no-desc {
  font-size: 14px;
  color: var(--text-muted);
  font-style: italic;
}

.place-detail__disclaimer {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
}

.place-detail__actions {
  display: flex;
  gap: 12px;
  padding: 16px;
  padding-bottom: max(16px, var(--safe-bottom));
  background: var(--bg-surface);
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.place-detail__action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--gm-red);
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  transition: opacity var(--transition-fast);

  &:active { opacity: 0.7; }
}

.place-detail__action-icon {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 2.5px solid var(--gm-red);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: background var(--transition-fast);

  &:hover { background: rgba(232, 64, 64, 0.08); }
}

.place-detail__loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
