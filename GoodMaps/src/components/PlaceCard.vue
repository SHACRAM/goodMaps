<template>
  <div class="place-card gm-card" @click="$emit('click')">
    <div class="place-card__icon">{{ categoryIcon }}</div>
    <div class="place-card__info">
      <h4 class="place-card__name">{{ place.name }}</h4>
      <p v-if="place.address" class="place-card__address">{{ place.address }}</p>
      <div class="place-card__badges">
        <span v-if="place.isOpen === true"  class="gm-tag gm-tag--green" style="font-size:11px;padding:2px 8px">Ouvert</span>
        <span v-if="place.isOpen === false" class="gm-tag gm-tag--grey"  style="font-size:11px;padding:2px 8px">Fermé</span>
        <span v-if="place.pmrAccess" class="gm-tag" style="font-size:11px;padding:2px 8px">♿</span>
        <span class="gm-tag" style="font-size:11px;padding:2px 8px">{{ place.category }}</span>
      </div>
    </div>
    <button class="place-card__fav gm-icon-btn" @click.stop="$emit('favorite')" :title="isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'">
      <i :class="isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'"
         :style="isFavorite ? 'color:var(--gm-red)' : 'color:var(--text-muted)'" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  place: { type: Object, required: true },
  isFavorite: { type: Boolean, default: false }
})
defineEmits(['click', 'favorite'])

const categoryIcon = computed(() => {
  return { culture: '🎭', nature: '🌿', food: '🍽️', sport: '⚽', shopping: '🛍️', nightlife: '🌙', other: '📍' }[props.place.category] || '📍'
})
</script>

<style scoped>
.place-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  cursor: pointer;
  transition: transform var(--transition-fast);
  &:active { transform: scale(0.98); }
}

.place-card__icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: rgba(232,64,64,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.place-card__info {
  flex: 1;
  min-width: 0;
}

.place-card__name {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.place-card__address {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.place-card__badges { display: flex; gap: 4px; flex-wrap: wrap; }

.place-card__fav {
  flex-shrink: 0;
  box-shadow: none;
  background: var(--bg-primary);
  font-size: 16px;
}
</style>
