<template>
  <div class="favs">
    <header class="favs__header">
      <button class="gm-icon-btn" @click="router.back()">
        <i class="pi pi-arrow-left" />
      </button>
      <h1 class="favs__title">Mes favoris</h1>
      <button v-if="favs.count > 0" class="favs__clear-btn" @click="confirmClear">
        <i class="pi pi-trash" />
      </button>
      <div v-else style="width:44px" />
    </header>

    <div class="favs__content">
      <TransitionGroup name="list" tag="div" class="favs__list">
        <div
          v-for="place in favs.favorites"
          :key="place.id"
          class="favs__item gm-card"
        >
          <div class="favs__item-icon">
            <span>{{ categoryIcon(place.category) }}</span>
          </div>
          <div class="favs__item-info" @click="openPlace(place)">
            <h3 class="favs__item-name">{{ place.name }}</h3>
            <p v-if="place.address" class="favs__item-address">{{ place.address }}</p>
            <div class="favs__item-badges">
              <span v-if="place.isOpen === true" class="gm-tag gm-tag--green" style="font-size:11px;padding:2px 8px">Ouvert</span>
              <span v-if="place.pmrAccess" class="gm-tag" style="font-size:11px;padding:2px 8px">♿</span>
            </div>
          </div>
          <button class="favs__remove-btn gm-icon-btn" @click="favs.toggle(place)" title="Retirer des favoris">
            <i class="pi pi-heart-fill" style="color:var(--gm-red)" />
          </button>
        </div>
      </TransitionGroup>

      <!-- Empty state -->
      <div v-if="favs.count === 0" class="favs__empty">
        <div class="favs__empty-icon">🗺️</div>
        <h2>Aucun favori</h2>
        <p>Appuyez sur le ♡ sur un lieu pour l'ajouter ici.</p>
        <button class="gm-btn-primary" style="width:auto;padding:12px 24px" @click="router.replace({ name: 'map' })">
          Explorer la carte
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useFavoritesStore } from '@/stores/favorites'
import { usePlacesStore } from '@/stores/places'

const router = useRouter()
const favs = useFavoritesStore()
const places = usePlacesStore()

function categoryIcon(cat) {
  return { culture: '🎭', nature: '🌿', food: '🍽️', sport: '⚽', shopping: '🛍️', nightlife: '🌙', other: '📍' }[cat] || '📍'
}

function openPlace(place) {
  places.selectPlace(place)
  router.push({ name: 'place-detail', params: { id: place.id } })
}

function confirmClear() {
  if (confirm('Supprimer tous les favoris ?')) favs.clear()
}
</script>

<style scoped>
.favs {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
}

.favs__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: max(12px, var(--safe-top));
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.favs__title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 900;
}

.favs__clear-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 18px;
  cursor: pointer;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all var(--transition-fast);

  &:hover { color: var(--gm-red); background: rgba(232,64,64,0.08); }
}

.favs__content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.favs__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.favs__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
}

.favs__item-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  background: rgba(232,64,64,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.favs__item-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.favs__item-name {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.favs__item-address {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.favs__item-badges { display: flex; gap: 4px; }

.favs__remove-btn {
  flex-shrink: 0;
  box-shadow: none;
  background: var(--bg-primary);
}

.favs__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
  text-align: center;
  padding: 32px;
}

.favs__empty-icon { font-size: 56px; }
.favs__empty h2 { font-family: var(--font-display); font-size: 22px; }
.favs__empty p { color: var(--text-secondary); font-size: 14px; }

.list-enter-active, .list-leave-active { transition: all 0.3s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-20px); }
</style>
