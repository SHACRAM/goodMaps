<template>
  <div class="map-view">

    <!-- ── Header ───────────────────────────── -->
    <header class="map-view__header">
      <div class="map-view__header-top">
        <div class="map-view__logo">
          <GmLogo :size="26" />
          <span class="map-view__wordmark">
            <span class="good">GOOD</span>&nbsp;<span class="maps">MAPS</span>
          </span>
        </div>
        <div class="map-view__header-right">
          <!-- Ville détectée -->
          <span v-if="placesStore.userLocation?.city" class="map-view__city">
            <i class="pi pi-map-marker" />{{ placesStore.userLocation.city }}
          </span>
          <button class="gm-icon-btn" @click="router.push({ name: 'favorites' })" aria-label="Favoris">
            <i class="pi pi-heart" />
            <span v-if="favsStore.count > 0" class="map-view__badge">{{ favsStore.count }}</span>
          </button>
          <button class="gm-icon-btn" @click="router.push({ name: 'preferences' })" aria-label="Préférences">
            <i class="pi pi-cog" />
          </button>
        </div>
      </div>

      <!-- Barre de recherche -->
      <div class="map-view__search-row">
        <SearchBar
          placeholder="Rechercher un lieu, une adresse..."
          :user-lat="placesStore.userLocation?.lat"
          :user-lng="placesStore.userLocation?.lng"
          @select="onSearchSelect"
        />
        <!-- Bouton filtres avec badge actif -->
        <button class="map-view__filter-btn" :class="{ 'has-filters': hasActiveFilters }" @click="showFilters = true">
          <i class="pi pi-sliders-h" />
          <span v-if="hasActiveFilters" class="map-view__filter-dot" />
        </button>
      </div>

      <!-- Chips catégories rapides -->
      <div class="map-view__chips">
        <button
          class="map-view__chip"
          :class="{ active: activeCategory === null }"
          @click="setCategory(null)"
        >🗺️ Tous <span v-if="placesStore.places.length" class="map-view__chip-count">{{ placesStore.places.length }}</span></button>
        <button
          v-for="c in CATEGORIES"
          :key="c.value"
          class="map-view__chip"
          :class="{ active: activeCategory === c.value }"
          @click="setCategory(c.value)"
        >
          {{ c.icon }} {{ c.label }}
          <span v-if="countByCategory(c.value)" class="map-view__chip-count">{{ countByCategory(c.value) }}</span>
        </button>
      </div>
    </header>

    <!-- ── Carte ─────────────────────────────── -->
    <div class="map-view__map-wrap">
      <LMap
        ref="mapRef"
        :zoom="zoom"
        :center="mapCenter"
        :use-global-leaflet="false"
        :zoom-control="false"
        class="map-view__map"
        @moveend="onMapMoveEnd"
      >
        <LTileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          layer-type="base"
        />

        <!-- Rayon de recherche (cercle) -->
        <LCircle
          v-if="placesStore.userLocation && showRadiusCircle"
          :lat-lng="[placesStore.userLocation.lat, placesStore.userLocation.lng]"
          :radius="activeRadius"
          color="#E84040"
          :fill-opacity="0.05"
          :weight="1.5"
          :dash-array="'6 4'"
        />

        <!-- Position utilisateur -->
        <LCircleMarker
          v-if="placesStore.userLocation"
          :lat-lng="[placesStore.userLocation.lat, placesStore.userLocation.lng]"
          :radius="9"
          color="white"
          fill-color="#E84040"
          :fill-opacity="1"
          :weight="3"
        />

        <!-- Épingle de recherche -->
        <LCircleMarker
          v-if="searchPin"
          :lat-lng="[searchPin.lat, searchPin.lng]"
          :radius="9"
          color="#E84040"
          fill-color="white"
          :fill-opacity="1"
          :weight="3"
        >
          <LPopup>{{ searchPin.name }}</LPopup>
        </LCircleMarker>

        <!-- Markers POI -->
        <LMarker
          v-for="place in filteredPlaces"
          :key="place.id"
          :lat-lng="[place.lat, place.lng]"
          @click="selectPlace(place)"
        >
          <LIcon
            :icon-url="markerSvg(place)"
            :icon-size="selectedPlace?.id === place.id ? [42, 54] : [30, 38]"
            :icon-anchor="selectedPlace?.id === place.id ? [21, 54] : [15, 38]"
          />
          <LTooltip :options="{ permanent: false, direction: 'top', offset: [0, -6] }">
            {{ place.name }}
          </LTooltip>
        </LMarker>

        <!-- Contrôles -->
        <LControl position="bottomright">
          <div class="map-ctrl-stack">
            <button class="map-ctrl-btn" @click="zoomIn" title="Zoom +"><i class="pi pi-plus" /></button>
            <button class="map-ctrl-btn" @click="zoomOut" title="Zoom -"><i class="pi pi-minus" /></button>
          </div>
        </LControl>
        <LControl position="bottomright">
          <button
            class="gm-icon-btn map-locate-btn"
            :class="{ spinning: isLocating }"
            @click="locateUser"
            title="Me localiser"
          >
            <i class="pi pi-map-marker" />
          </button>
        </LControl>
        <LControl position="topright">
          <button
            class="map-radius-toggle"
            :class="{ active: showRadiusCircle }"
            @click="showRadiusCircle = !showRadiusCircle"
            title="Afficher/Masquer le rayon"
          >
            <i class="pi pi-circle" />
            {{ radiusLabel }}
          </button>
        </LControl>
      </LMap>

      <!-- Overlay localisation -->
      <Transition name="fade">
        <div v-if="isLocating && !placesStore.userLocation" class="map-view__overlay">
          <div class="map-view__locating-box">
            <div class="gm-spinner" />
            <p>Localisation en cours...</p>
          </div>
        </div>
      </Transition>
    </div>

    <!-- ── Bottom Sheet ──────────────────────── -->
    <div class="map-view__bottom" :class="{ expanded: sheetExpanded }">
      <!-- Poignée / toggle -->
      <div class="map-view__handle" @click="sheetExpanded = !sheetExpanded">
        <div class="map-view__handle-bar" />
        <span class="map-view__handle-hint">
          <template v-if="sheetExpanded">Réduire</template>
          <template v-else-if="filteredPlaces.length">
            {{ filteredPlaces.length }} lieu{{ filteredPlaces.length > 1 ? 'x' : '' }}
            <span v-if="activeFiltersLabel" class="map-view__handle-filters">· {{ activeFiltersLabel }}</span>
          </template>
          <template v-else>Aucun résultat</template>
        </span>
      </div>

      <!-- Bouton Rechercher -->
      <div class="map-view__suggest-wrap">
        <button
          class="gm-btn-primary"
          :disabled="placesStore.isLoading || !placesStore.userLocation"
          @click="fetchSuggestions"
        >
          <div v-if="placesStore.isLoading" class="btn-spinner" />
          <i v-else class="pi pi-search" />
          {{ placesStore.isLoading ? 'Recherche en cours...' : 'Rechercher dans cette zone' }}
        </button>
      </div>

      <!-- Résumé des filtres actifs -->
      <div v-if="hasActiveFilters" class="map-view__active-filters">
        <span class="map-view__active-filter-tag" v-if="activeRadius !== 2000">
          📍 {{ radiusLabel }}
          <button @click="resetRadius">×</button>
        </span>
        <span class="map-view__active-filter-tag" v-if="activePmrFilter !== 'all'">
          ♿ PMR
          <button @click="resetPmr">×</button>
        </span>
        <span class="map-view__active-filter-tag" v-if="activeInterests.length">
          🗂️ {{ activeInterests.length }} catégorie{{ activeInterests.length > 1 ? 's' : '' }}
          <button @click="resetInterests">×</button>
        </span>
        <span class="map-view__active-filter-tag" v-if="openFilter !== 'all'">
          ✅ Ouverts
          <button @click="openFilter = 'all'">×</button>
        </span>
      </div>

      <!-- Carte du lieu sélectionné (bottom sheet réduit) -->
      <Transition name="slide-up">
        <div
          v-if="selectedPlace && !sheetExpanded"
          class="map-view__selected-card gm-card"
          @click="openDetail(selectedPlace)"
        >
          <div class="selected-card__emoji">{{ catIcon(selectedPlace.category) }}</div>
          <div class="selected-card__info">
            <div class="selected-card__row">
              <h3 class="selected-card__name">{{ selectedPlace.name }}</h3>
              <OpenBadge :is-open="selectedPlace.isOpen" :closing-time="selectedPlace.closingTime" />
            </div>
            <p v-if="selectedPlace.typeLabel" class="selected-card__type">{{ selectedPlace.typeLabel }}</p>
            <p v-if="selectedPlace.address" class="selected-card__address">{{ selectedPlace.address }}</p>
            <div class="selected-card__tags">
              <span v-if="selectedPlace.pmrAccess" class="gm-tag">♿ Accessible</span>
              <span v-else-if="selectedPlace.pmrLimited" class="gm-tag" style="background:rgba(234,179,8,0.12);color:#a16207">⚠️ Partiel</span>
            </div>
          </div>
          <div class="selected-card__actions">
            <button class="gm-icon-btn" style="width:36px;height:36px;box-shadow:none;background:var(--bg-primary)" @click.stop="favsStore.toggle(selectedPlace)">
              <i :class="favsStore.isFavorite(selectedPlace.id) ? 'pi pi-heart-fill' : 'pi pi-heart'"
                 :style="favsStore.isFavorite(selectedPlace.id) ? {color:'var(--gm-red)'} : {}" />
            </button>
            <i class="pi pi-chevron-right selected-card__arrow" />
          </div>
        </div>
      </Transition>

      <!-- Liste complète (bottom sheet ouvert) -->
      <div v-if="sheetExpanded" class="map-view__list">
        <!-- Tri -->
        <div class="map-view__list-controls">
          <span class="map-view__list-count">{{ filteredPlaces.length }} résultat{{ filteredPlaces.length > 1 ? 's' : '' }}</span>
          <div class="map-view__sort-btns">
            <button
              v-for="s in sortOptions"
              :key="s.value"
              class="map-view__sort-btn"
              :class="{ active: sortBy === s.value }"
              @click="sortBy = s.value"
            >{{ s.label }}</button>
          </div>
        </div>

        <div v-if="filteredPlaces.length === 0 && searched" class="map-view__empty">
          <span style="font-size:36px">🔍</span>
          <p><strong>Aucun lieu trouvé</strong></p>
          <p>Essayez d'augmenter le rayon ou de changer les catégories</p>
          <button class="gm-btn-secondary" style="width:auto;padding:10px 20px;margin-top:8px" @click="showFilters = true">
            Modifier les filtres
          </button>
        </div>

        <PlaceCard
          v-for="place in sortedPlaces"
          :key="place.id"
          :place="place"
          :is-favorite="favsStore.isFavorite(place.id)"
          @click="selectAndFly(place)"
          @favorite="favsStore.toggle(place)"
        />
      </div>
    </div>

    <!-- ── Panneau de filtres ─────────────────── -->
    <FilterPanel
      :visible="showFilters"
      :radius="activeRadius"
      :pmr="activePmrFilter === 'yes'"
      :interests="activeInterests"
      :open-filter="openFilter"
      @close="showFilters = false"
      @apply="applyFilters"
    />

    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { LMap, LTileLayer, LMarker, LIcon, LCircleMarker, LCircle, LControl, LTooltip, LPopup } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import Toast from 'primevue/toast'
import { usePlacesStore } from '@/stores/places'
import { usePreferencesStore } from '@/stores/preferences'
import { useFavoritesStore } from '@/stores/favorites'
import GmLogo from '@/components/GmLogo.vue'
import PlaceCard from '@/components/PlaceCard.vue'
import SearchBar from '@/components/SearchBar.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import OpenBadge from '@/components/OpenBadge.vue'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()
const placesStore = usePlacesStore()
const prefs = usePreferencesStore()
const favsStore = useFavoritesStore()

// ── Refs ─────────────────────────────────────────────────────
const mapRef = ref(null)
const zoom = ref(14)
const isLocating = ref(false)
const selectedPlace = ref(null)
const searched = ref(false)
const sheetExpanded = ref(false)
const showFilters = ref(false)
const showRadiusCircle = ref(true)
const searchPin = ref(null)
const activeCategory = ref(null)
const sortBy = ref('score')

// Filtres actifs (indépendants des préférences globales)
const activeRadius = ref(prefs.radius)
const activePmrFilter = ref(prefs.pmr ? 'yes' : 'all')
const activeInterests = ref([...prefs.interests])
const openFilter = ref('all')

// ── Constantes ───────────────────────────────────────────────
const CATEGORIES = [
  { value: 'culture',   icon: '🎭', label: 'Culture' },
  { value: 'food',      icon: '🍽️', label: 'Resto' },
  { value: 'nature',    icon: '🌿', label: 'Nature' },
  { value: 'sport',     icon: '⚽', label: 'Sport' },
  { value: 'shopping',  icon: '🛍️', label: 'Shopping' },
  { value: 'nightlife', icon: '🌙', label: 'Nuit' },
  { value: 'services',  icon: '🏥', label: 'Services' },
  { value: 'hotel',     icon: '🏨', label: 'Hôtels' },
]

const CATEGORY_COLORS = {
  culture: '#9333EA', nature: '#16A34A', food: '#EA580C',
  sport: '#2563EB', shopping: '#DB2777', nightlife: '#6D28D9',
  services: '#0891B2', hotel: '#B45309', transport: '#64748B', other: '#E84040'
}

const sortOptions = [
  { value: 'score',    label: '⭐ Qualité' },
  { value: 'open',     label: '✅ Ouverts' },
  { value: 'name',     label: '🔤 Nom' },
  { value: 'pmr',      label: '♿ PMR' },
]

// ── Computed ─────────────────────────────────────────────────
const mapCenter = computed(() => {
  if (placesStore.userLocation) return [placesStore.userLocation.lat, placesStore.userLocation.lng]
  return [48.8566, 2.3522]
})

const radiusLabel = computed(() => {
  const r = activeRadius.value
  return r >= 1000 ? `${(r/1000).toFixed(r % 1000 === 0 ? 0 : 1)}km` : `${r}m`
})

const hasActiveFilters = computed(() =>
  activeRadius.value !== 2000 ||
  activePmrFilter.value !== 'all' ||
  activeInterests.value.length > 0 ||
  openFilter.value !== 'all'
)

const activeFiltersLabel = computed(() => {
  const parts = []
  if (activeRadius.value !== 2000) parts.push(radiusLabel.value)
  if (activePmrFilter.value !== 'all') parts.push('PMR')
  if (openFilter.value !== 'all') parts.push('Ouverts')
  if (activeInterests.value.length) parts.push(`${activeInterests.value.length} cat.`)
  return parts.join(' · ')
})

// Filtrage et tri des lieux
const filteredPlaces = computed(() => {
  let places = placesStore.places

  // Filtre catégorie (chip rapide)
  if (activeCategory.value) {
    places = places.filter(p => p.category === activeCategory.value)
  }

  // Filtre "ouverts maintenant"
  if (openFilter.value === 'open') {
    places = places.filter(p => p.isOpen === true)
  }

  return places
})

const sortedPlaces = computed(() => {
  const arr = [...filteredPlaces.value]
  if (sortBy.value === 'name') return arr.sort((a, b) => a.name.localeCompare(b.name))
  if (sortBy.value === 'open') return arr.sort((a, b) => (b.isOpen ? 1 : 0) - (a.isOpen ? 1 : 0))
  if (sortBy.value === 'pmr') return arr.sort((a, b) => (b.pmrAccess ? 2 : b.pmrLimited ? 1 : 0) - (a.pmrAccess ? 2 : a.pmrLimited ? 1 : 0))
  return arr // score (already sorted by service)
})

// ── Methods ──────────────────────────────────────────────────
function catIcon(cat) {
  return { culture:'🎭', nature:'🌿', food:'🍽️', sport:'⚽', shopping:'🛍️', nightlife:'🌙', services:'🏥', hotel:'🏨', transport:'🚌', other:'📍' }[cat] || '📍'
}

function countByCategory(cat) {
  return placesStore.places.filter(p => p.category === cat).length || 0
}

function markerSvg(place) {
  const selected = selectedPlace.value?.id === place.id
  const color = CATEGORY_COLORS[place.category] || '#E84040'
  const fav = favsStore.isFavorite(place.id)
  const inner = fav ? '♥' : catIcon(place.category)
  const s = selected ? 42 : 30
  const h = Math.round(s * 1.28)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 54" width="${s}" height="${h}">
    <defs><filter id="d"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-opacity="${selected ? 0.45 : 0.25}"/></filter></defs>
    <path d="M21 2C11.06 2 3 10.06 3 20C3 33 21 52 21 52C21 52 39 33 39 20C39 10.06 30.94 2 21 2Z"
      fill="${color}" filter="url(#d)" ${selected ? `stroke="white" stroke-width="2.5"` : ''}/>
    <text x="21" y="23" text-anchor="middle" dominant-baseline="middle" font-size="${selected ? 14 : 11}" fill="white">${inner}</text>
  </svg>`
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
}

function setCategory(cat) {
  activeCategory.value = cat
  selectedPlace.value = null
}

function applyFilters({ radius, pmr, pmrFilter, interests, openFilter: of }) {
  activeRadius.value = radius
  activePmrFilter.value = pmrFilter
  activeInterests.value = interests
  openFilter.value = of
  prefs.setRadius(radius)
  prefs.setPmr(pmr)
  prefs.setInterests(interests)
}

function resetRadius() { activeRadius.value = 2000; prefs.setRadius(2000) }
function resetPmr() { activePmrFilter.value = 'all'; prefs.setPmr(false) }
function resetInterests() { activeInterests.value = []; prefs.setInterests([]) }

// ── Localisation ─────────────────────────────────────────────
onMounted(async () => {
  if (!placesStore.userLocation) await locateUser()
})

async function locateUser() {
  isLocating.value = true
  try {
    await placesStore.detectLocation()
    flyTo(placesStore.userLocation.lat, placesStore.userLocation.lng, 14)
  } catch {
    toast.add({ severity: 'warn', summary: 'Localisation', detail: t('errors.locationDenied'), life: 5000 })
  } finally {
    isLocating.value = false
  }
}

// ── Recherche ────────────────────────────────────────────────
async function fetchSuggestions() {
  searched.value = true
  selectedPlace.value = null
  sheetExpanded.value = false

  try {
    await placesStore.fetchSuggestions({
      radius: activeRadius.value,
      interests: activeInterests.value,
      pmr: activePmrFilter.value === 'yes',
      pmrFilter: activePmrFilter.value,
    })

    if (placesStore.places.length > 0) {
      sheetExpanded.value = true
      // Adapter la vue
      const coords = placesStore.places.slice(0, 30).map(p => [p.lat, p.lng])
      if (placesStore.userLocation) coords.push([placesStore.userLocation.lat, placesStore.userLocation.lng])
      setTimeout(() => {
        mapRef.value?.leafletObject?.fitBounds(coords, { padding: [60, 80], maxZoom: 16 })
      }, 100)
      toast.add({
        severity: 'success',
        summary: `${placesStore.places.length} lieux trouvés`,
        detail: `dans un rayon de ${radiusLabel.value}`,
        life: 3000
      })
    } else {
      sheetExpanded.value = true
      toast.add({ severity: 'info', summary: 'Aucun résultat', detail: 'Essayez d\'augmenter le rayon de recherche.', life: 4000 })
    }
  } catch (err) {
    console.error(err)
    toast.add({
      severity: 'error',
      summary: 'Erreur de connexion',
      detail: 'Impossible de contacter l\'API. Réessayez dans quelques secondes.',
      life: 6000
    })
  }
}

function selectPlace(place) {
  selectedPlace.value = place
  sheetExpanded.value = false
}

function selectAndFly(place) {
  selectedPlace.value = place
  sheetExpanded.value = false
  flyTo(place.lat, place.lng, 17)
}

function openDetail(place) {
  placesStore.selectPlace(place)
  router.push({ name: 'place-detail', params: { id: place.id } })
}

function onSearchSelect({ lat, lng, name }) {
  searchPin.value = { lat, lng, name }
  flyTo(lat, lng, 16)
}

function onMapMoveEnd() {
  // future: search in visible area
}

function flyTo(lat, lng, z = 15) {
  mapRef.value?.leafletObject?.flyTo([lat, lng], z, { duration: 0.85 })
}
function zoomIn()  { mapRef.value?.leafletObject?.zoomIn() }
function zoomOut() { mapRef.value?.leafletObject?.zoomOut() }
</script>

<style scoped>
.map-view {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-primary);
}

/* ── Header ────────────────────────────────────────────────── */
.map-view__header {
  flex-shrink: 0;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
  z-index: 10;
  padding: 0 0 8px;
}

.map-view__header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  padding-top: max(10px, var(--safe-top));
}

.map-view__logo {
  display: flex;
  align-items: center;
  gap: 8px;
}
.map-view__wordmark {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 0.5px;
  .good { color: var(--text-primary); }
  .maps { color: var(--gm-red); }
}
.map-view__header-right {
  display: flex;
  align-items: center;
  gap: 6px;
}
.map-view__city {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
  i { font-size: 10px; color: var(--gm-red); }
}
.map-view__badge {
  position: absolute;
  top: -4px; right: -4px;
  background: var(--gm-red);
  color: white;
  font-size: 9px;
  font-weight: 700;
  width: 15px; height: 15px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Search row */
.map-view__search-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  margin-bottom: 8px;
}

.map-view__filter-btn {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all var(--transition-fast);

  &.has-filters {
    border-color: var(--gm-red);
    color: var(--gm-red);
    background: rgba(232,64,64,0.07);
  }
}
.map-view__filter-dot {
  position: absolute;
  top: 6px; right: 6px;
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--gm-red);
}

/* Category chips */
.map-view__chips {
  display: flex;
  gap: 6px;
  padding: 0 14px;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}
.map-view__chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 11px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-body);
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--transition-fast);

  &.active {
    border-color: var(--gm-red);
    background: rgba(232,64,64,0.08);
    color: var(--gm-red);
  }
}
.map-view__chip-count {
  background: rgba(232,64,64,0.15);
  color: var(--gm-red);
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  min-width: 18px;
  text-align: center;
}

/* ── Map ─────────────────────────────────────────────────────── */
.map-view__map-wrap {
  flex: 1;
  position: relative;
  min-height: 0;
}
.map-view__map { height: 100%; width: 100%; }

.map-view__overlay {
  position: absolute; inset: 0;
  background: var(--overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.map-view__locating-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: var(--bg-surface);
  padding: 24px 32px;
  border-radius: var(--radius-md);
  font-weight: 600;
  box-shadow: var(--shadow-lg);
  p { color: var(--text-secondary); font-size: 14px; }
}

/* Map controls */
.map-ctrl-stack {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;
}
.map-ctrl-btn {
  width: 36px; height: 36px;
  background: var(--bg-surface);
  border: none;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  transition: background var(--transition-fast);
  &:first-child { border-radius: var(--radius-sm) var(--radius-sm) 0 0; }
  &:last-child  { border-radius: 0 0 var(--radius-sm) var(--radius-sm); }
  &:hover { background: var(--bg-primary); }
}
.map-locate-btn {
  margin-bottom: 8px;
  box-shadow: var(--shadow-md);
}
.map-locate-btn.spinning i { animation: spin 1s linear infinite; }

.map-radius-toggle {
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--bg-surface);
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-full);
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-body);
  color: var(--text-secondary);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  margin-top: 10px;

  &.active {
    border-color: var(--gm-red);
    color: var(--gm-red);
    background: rgba(232,64,64,0.06);
  }
  i { font-size: 12px; }
}

/* ── Bottom Sheet ────────────────────────────────────────────── */
.map-view__bottom {
  flex-shrink: 0;
  background: var(--bg-surface);
  border-top: 1px solid var(--border-color);
  box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
  /* hauteur fixe — la liste interne scrolle */
  height: 52vh;
  display: flex;
  flex-direction: column;
  transition: height var(--transition-slow);
  overflow: hidden;

  &.expanded { height: 72vh; }
}

/* Seule la liste défile */
.map-view__list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}
.map-view__handle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
}
.map-view__handle-bar {
  width: 36px; height: 4px;
  border-radius: 2px;
  background: var(--border-color);
}
.map-view__handle-hint {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}
.map-view__handle-filters {
  color: var(--gm-red);
}

/* Suggest wrap */
.map-view__suggest-wrap {
  padding: 0 16px 10px;
  flex-shrink: 0;
}

/* Active filters tags */
.map-view__active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 16px 10px;
}
.map-view__active-filter-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(232,64,64,0.08);
  border: 1px solid rgba(232,64,64,0.25);
  color: var(--gm-red);
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px 3px 10px;

  button {
    background: none;
    border: none;
    color: var(--gm-red);
    font-size: 14px;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
  }
}

/* Selected place card */
.map-view__selected-card {
  margin: 0 16px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  cursor: pointer;
  transition: transform var(--transition-fast);
  &:active { transform: scale(0.98); }
}
.selected-card__emoji {
  font-size: 24px;
  width: 44px; height: 44px;
  background: rgba(232,64,64,0.07);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.selected-card__info { flex: 1; min-width: 0; }
.selected-card__row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 2px;
}
.selected-card__name {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.selected-card__type {
  font-size: 11px;
  color: var(--gm-red);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}
.selected-card__address {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}
.selected-card__tags { display: flex; gap: 4px; flex-wrap: wrap; }
.selected-card__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.selected-card__arrow { color: var(--text-muted); font-size: 13px; }

/* List controls */
.map-view__list-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 4px;
}
.map-view__list-count {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
}
.map-view__sort-btns {
  display: flex;
  gap: 4px;
}
.map-view__sort-btn {
  padding: 4px 8px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--border-color);
  background: none;
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-body);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;

  &.active { border-color: var(--gm-red); color: var(--gm-red); background: rgba(232,64,64,0.07); }
}
.map-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 16px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
  p:first-of-type { font-size: 15px; }
}

/* Spinner dans le bouton */
.btn-spinner {
  width: 18px; height: 18px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Leaflet */
:deep(.leaflet-control) { border: none !important; }
:deep(.leaflet-bottom.leaflet-right) { bottom: 10px !important; right: 10px !important; }
:deep(.leaflet-top.leaflet-right) { top: 10px !important; right: 10px !important; }
:deep(.leaflet-popup-content-wrapper) {
  background: var(--bg-surface) !important;
  color: var(--text-primary) !important;
  border-radius: var(--radius-md) !important;
  box-shadow: var(--shadow-md) !important;
}
:deep(.leaflet-popup-tip) { background: var(--bg-surface) !important; }
:deep(.leaflet-tooltip) {
  background: var(--bg-surface) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: var(--radius-sm) !important;
  font-family: var(--font-body) !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  box-shadow: var(--shadow-sm) !important;
}
</style>
