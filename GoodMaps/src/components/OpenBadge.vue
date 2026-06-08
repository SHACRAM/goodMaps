<template>
  <span v-if="isOpen === true" class="badge badge--open">
    ● Ouvert{{ closingTime ? ` jusqu'à ${closingTime}` : '' }}
  </span>
  <span v-else-if="isOpen === false" class="badge badge--closed">
    ● Fermé
  </span>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, default: null },
  closingTime: { type: String, default: null },
})
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  white-space: nowrap;
}
.badge--open {
  background: rgba(22,163,74,0.12);
  color: #16a34a;
}
.badge--closed {
  background: rgba(150,150,150,0.12);
  color: #888;
}
</style>
