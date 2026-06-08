<template>
  <div class="search-bar" :class="{ expanded: isExpanded }">
    <div class="search-bar__input-wrap">
      <i class="pi pi-search search-bar__icon" />
      <input
        ref="inputRef"
        v-model="query"
        class="search-bar__input"
        :placeholder="placeholder || 'Rechercher un lieu...'"
        @focus="isExpanded = true"
        @input="onInput"
        @keydown.esc="close"
        @keydown.enter="submitFirst"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />
      <button v-if="query" class="search-bar__clear" @click="clear">
        <i class="pi pi-times" />
      </button>
      <button v-if="isExpanded && !query" class="search-bar__cancel" @click="close">
        Annuler
      </button>
    </div>

    <!-- Results dropdown -->
    <Transition name="fade">
      <div v-if="isExpanded && (results.length > 0 || isLoading || query)" class="search-bar__results">
        <div v-if="isLoading" class="search-bar__loading">
          <div class="gm-spinner" style="width:18px;height:18px;border-width:2px" />
          <span>Recherche...</span>
        </div>
        <div v-else-if="results.length === 0 && query.length >= 2" class="search-bar__empty">
          Aucun résultat pour « {{ query }} »
        </div>
        <button
          v-for="result in results"
          :key="result.place_id"
          class="search-bar__result"
          @click="selectResult(result)"
        >
          <i class="pi pi-map-marker search-bar__result-icon" />
          <div class="search-bar__result-info">
            <span class="search-bar__result-name">{{ result.display_name.split(',')[0] }}</span>
            <span class="search-bar__result-sub">{{ formatAddress(result) }}</span>
          </div>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { placesService } from '@/services/places.service'

const props = defineProps({
  placeholder: String,
  userLat: Number,
  userLng: Number,
})

const emit = defineEmits(['select'])

const query = ref('')
const results = ref([])
const isExpanded = ref(false)
const isLoading = ref(false)
const inputRef = ref(null)
let debounceTimer = null

function onInput() {
  clearTimeout(debounceTimer)
  if (query.value.length < 2) {
    results.value = []
    return
  }
  debounceTimer = setTimeout(search, 380)
}

async function search() {
  if (query.value.length < 2) return
  isLoading.value = true
  try {
    results.value = await placesService.geocodeSearch(query.value, props.userLat, props.userLng)
  } catch {
    results.value = []
  } finally {
    isLoading.value = false
  }
}

function selectResult(result) {
  emit('select', {
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
    name: result.display_name.split(',')[0],
    fullAddress: result.display_name,
  })
  query.value = result.display_name.split(',')[0]
  results.value = []
  isExpanded.value = false
  inputRef.value?.blur()
}

function submitFirst() {
  if (results.value.length > 0) selectResult(results.value[0])
}

function clear() {
  query.value = ''
  results.value = []
  inputRef.value?.focus()
}

function close() {
  isExpanded.value = false
  results.value = []
  inputRef.value?.blur()
}

function formatAddress(r) {
  const a = r.address || {}
  return [a.city || a.town || a.village, a.country].filter(Boolean).join(', ')
}
</script>

<style scoped>
.search-bar {
  position: relative;
  z-index: 100;
}

.search-bar__input-wrap {
  display: flex;
  align-items: center;
  background: var(--bg-surface);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-md);
  padding: 0 14px;
  gap: 8px;
  height: 44px;
  transition: border-radius var(--transition-fast);
}

.search-bar.expanded .search-bar__input-wrap {
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  box-shadow: none;
}

.search-bar__icon {
  color: var(--text-muted);
  font-size: 14px;
  flex-shrink: 0;
}

.search-bar__input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--text-primary);
  outline: none;
  min-width: 0;

  &::placeholder { color: var(--text-muted); }
}

.search-bar__clear,
.search-bar__cancel {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 13px;
  font-family: var(--font-body);
  padding: 0;
  flex-shrink: 0;
  transition: color var(--transition-fast);

  &:hover { color: var(--text-primary); }
}

.search-bar__cancel {
  color: var(--gm-red);
  font-weight: 600;
}

.search-bar__results {
  position: absolute;
  top: 44px;
  left: 0; right: 0;
  background: var(--bg-surface);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  max-height: 280px;
  overflow-y: auto;
}

.search-bar__loading,
.search-bar__empty {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  font-size: 14px;
  color: var(--text-muted);
}

.search-bar__result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: none;
  border: none;
  border-top: 1px solid var(--border-color);
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background var(--transition-fast);

  &:hover { background: var(--bg-primary); }
  &:first-child { border-top: none; }
}

.search-bar__result-icon {
  color: var(--gm-red);
  font-size: 14px;
  flex-shrink: 0;
}

.search-bar__result-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.search-bar__result-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-bar__result-sub {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
