<template>
  <Transition name="panel-slide">
    <div v-if="visible" class="filter-panel">
      <div class="filter-panel__backdrop" @click="$emit('close')" />
      <div class="filter-panel__sheet">
        <!-- Handle -->
        <div class="filter-panel__handle-wrap" @click="$emit('close')">
          <div class="filter-panel__handle" />
        </div>

        <div class="filter-panel__content">
          <div class="filter-panel__header">
            <h2 class="filter-panel__title">Filtres de recherche</h2>
            <button class="filter-panel__reset" @click="reset">Réinitialiser</button>
          </div>

          <!-- Rayon -->
          <section class="filter-panel__section">
            <div class="filter-panel__section-header">
              <span class="filter-panel__section-label">📍 Rayon de recherche</span>
              <span class="filter-panel__section-value">{{ radiusLabel }}</span>
            </div>
            <!-- Boutons preset -->
            <div class="filter-panel__radius-presets">
              <button
                v-for="p in radiusPresets"
                :key="p.value"
                class="filter-panel__preset-btn"
                :class="{ active: localRadius === p.value }"
                @click="localRadius = p.value"
              >{{ p.label }}</button>
            </div>
            <!-- Slider fin -->
            <input
              type="range"
              v-model.number="localRadius"
              :min="200"
              :max="20000"
              :step="100"
              class="filter-panel__slider"
              :style="sliderStyle"
            />
            <div class="filter-panel__slider-bounds">
              <span>200m</span><span>20 km</span>
            </div>
          </section>

          <!-- PMR -->
          <section class="filter-panel__section">
            <div class="filter-panel__section-header">
              <span class="filter-panel__section-label">♿ Accessibilité PMR</span>
            </div>
            <div class="filter-panel__pmr-opts">
              <button
                v-for="opt in pmrOptions"
                :key="opt.value"
                class="filter-panel__pmr-btn"
                :class="{ active: localPmr === opt.value }"
                @click="localPmr = opt.value"
              >
                <span class="filter-panel__pmr-icon">{{ opt.icon }}</span>
                <span>{{ opt.label }}</span>
              </button>
            </div>
          </section>

          <!-- Catégories -->
          <section class="filter-panel__section">
            <div class="filter-panel__section-header">
              <span class="filter-panel__section-label">🗂️ Catégories</span>
              <button class="filter-panel__select-all" @click="toggleAllCategories">
                {{ allSelected ? 'Tout désélectionner' : 'Tout sélectionner' }}
              </button>
            </div>
            <div class="filter-panel__categories">
              <button
                v-for="cat in categories"
                :key="cat.value"
                class="filter-panel__cat-btn"
                :class="{ active: localInterests.includes(cat.value) }"
                @click="toggleCategory(cat.value)"
              >
                <span class="filter-panel__cat-icon">{{ cat.icon }}</span>
                <span class="filter-panel__cat-label">{{ cat.label }}</span>
                <span v-if="localInterests.includes(cat.value)" class="filter-panel__cat-check">✓</span>
              </button>
            </div>
          </section>

          <!-- Horaires -->
          <section class="filter-panel__section">
            <div class="filter-panel__section-header">
              <span class="filter-panel__section-label">🕐 Horaires</span>
            </div>
            <div class="filter-panel__pmr-opts">
              <button
                v-for="opt in openOptions"
                :key="opt.value"
                class="filter-panel__pmr-btn"
                :class="{ active: localOpenFilter === opt.value }"
                @click="localOpenFilter = opt.value"
              >
                <span>{{ opt.icon }}</span>
                <span>{{ opt.label }}</span>
              </button>
            </div>
          </section>
        </div>

        <!-- CTA -->
        <div class="filter-panel__footer">
          <button class="gm-btn-primary" @click="apply">
            <i class="pi pi-search" />
            Rechercher
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  radius: { type: Number, default: 2000 },
  pmr: { type: Boolean, default: false },
  interests: { type: Array, default: () => [] },
  openFilter: { type: String, default: 'all' },
})

const emit = defineEmits(['close', 'apply'])

const localRadius = ref(props.radius)
const localPmr = ref(props.pmr ? 'yes' : 'all')
const localInterests = ref([...props.interests])
const localOpenFilter = ref(props.openFilter || 'all')

// Sync quand visible s'ouvre
watch(() => props.visible, (v) => {
  if (v) {
    localRadius.value = props.radius
    localPmr.value = props.pmr ? 'yes' : 'all'
    localInterests.value = [...props.interests]
    localOpenFilter.value = props.openFilter || 'all'
  }
})

const sliderStyle = computed(() => {
  const pct = ((localRadius.value - 200) / (20000 - 200)) * 100
  return {
    background: `linear-gradient(to right, var(--gm-red) 0%, var(--gm-red) ${pct}%, var(--border-color) ${pct}%, var(--border-color) 100%)`
  }
})

const radiusLabel = computed(() =>
  localRadius.value >= 1000
    ? `${(localRadius.value / 1000).toFixed(localRadius.value % 1000 === 0 ? 0 : 1)} km`
    : `${localRadius.value} m`
)

const radiusPresets = [
  { value: 500,   label: '500m' },
  { value: 1000,  label: '1km' },
  { value: 2000,  label: '2km' },
  { value: 5000,  label: '5km' },
  { value: 10000, label: '10km' },
  { value: 20000, label: '20km' },
]

const pmrOptions = [
  { value: 'all',     icon: '🌐', label: 'Tous les lieux' },
  { value: 'yes',     icon: '♿', label: 'Accessibles PMR' },
  { value: 'limited', icon: '⚠️', label: 'Partiellement' },
]

const openOptions = [
  { value: 'all',  icon: '🕐', label: 'Tous' },
  { value: 'open', icon: '✅', label: 'Ouverts maintenant' },
]

const categories = [
  { value: 'culture',   icon: '🎭', label: 'Culture & Musées' },
  { value: 'nature',    icon: '🌿', label: 'Nature & Parcs' },
  { value: 'food',      icon: '🍽️', label: 'Restaurants & Cafés' },
  { value: 'sport',     icon: '⚽', label: 'Sport & Loisirs' },
  { value: 'shopping',  icon: '🛍️', label: 'Shopping' },
  { value: 'nightlife', icon: '🌙', label: 'Vie nocturne' },
  { value: 'services',  icon: '🏥', label: 'Services' },
  { value: 'hotel',     icon: '🏨', label: 'Hébergement' },
  { value: 'transport', icon: '🚌', label: 'Transport' },
]

const allSelected = computed(() => localInterests.value.length === categories.length)

function toggleCategory(val) {
  const idx = localInterests.value.indexOf(val)
  if (idx === -1) localInterests.value.push(val)
  else localInterests.value.splice(idx, 1)
}

function toggleAllCategories() {
  if (allSelected.value) localInterests.value = []
  else localInterests.value = categories.map(c => c.value)
}

function reset() {
  localRadius.value = 2000
  localPmr.value = 'all'
  localInterests.value = []
  localOpenFilter.value = 'all'
}

function apply() {
  emit('apply', {
    radius: localRadius.value,
    pmr: localPmr.value === 'yes',
    pmrFilter: localPmr.value,
    interests: localInterests.value,
    openFilter: localOpenFilter.value,
  })
  emit('close')
}
</script>

<style scoped>
.filter-panel {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.filter-panel__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.45);
}

.filter-panel__sheet {
  position: relative;
  width: 100%;
  max-height: 88vh;
  background: var(--bg-surface);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.filter-panel__handle-wrap {
  display: flex;
  justify-content: center;
  padding: 12px;
  cursor: pointer;
  flex-shrink: 0;
}

.filter-panel__handle {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: var(--border-color);
}

.filter-panel__content {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 8px;
}

.filter-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.filter-panel__title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 900;
}

.filter-panel__reset {
  background: none;
  border: none;
  color: var(--gm-red);
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
}

.filter-panel__section {
  margin-bottom: 24px;
}

.filter-panel__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.filter-panel__section-label {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.filter-panel__section-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--gm-red);
}

.filter-panel__select-all {
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 600;
  color: var(--gm-red);
  font-family: var(--font-body);
  cursor: pointer;
}

/* Radius presets */
.filter-panel__radius-presets {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.filter-panel__preset-btn {
  padding: 6px 14px;
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
    background: rgba(232,64,64,0.08);
    color: var(--gm-red);
  }
}

/* Slider natif custom */
.filter-panel__slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  border-radius: 3px;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--gm-red);
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(232,64,64,0.4);
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--gm-red);
    border: 3px solid white;
    cursor: pointer;
  }
}

.filter-panel__slider-bounds {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}

/* PMR / Open options */
.filter-panel__pmr-opts {
  display: flex;
  gap: 8px;
}

.filter-panel__pmr-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-primary);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  line-height: 1.3;

  span:first-child { font-size: 20px; }

  &.active {
    border-color: var(--gm-red);
    background: rgba(232,64,64,0.07);
    color: var(--gm-red);
  }
}

/* Categories */
.filter-panel__categories {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.filter-panel__cat-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-color);
  background: var(--bg-primary);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  position: relative;

  &.active {
    border-color: var(--gm-red);
    background: rgba(232,64,64,0.07);
    color: var(--gm-red);
  }
}

.filter-panel__cat-icon { font-size: 18px; flex-shrink: 0; }
.filter-panel__cat-label { flex: 1; min-width: 0; }
.filter-panel__cat-check {
  font-size: 11px;
  color: var(--gm-red);
  font-weight: 700;
}

/* Footer */
.filter-panel__footer {
  padding: 16px;
  padding-bottom: max(16px, var(--safe-bottom));
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
  background: var(--bg-surface);
}

/* Transition */
.panel-slide-enter-active, .panel-slide-leave-active {
  transition: opacity var(--transition-slow);
  .filter-panel__sheet { transition: transform var(--transition-slow); }
}
.panel-slide-enter-from, .panel-slide-leave-to {
  opacity: 0;
  .filter-panel__sheet { transform: translateY(100%); }
}
</style>
