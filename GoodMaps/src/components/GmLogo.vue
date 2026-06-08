<template>
  <svg :width="size" :height="size" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Pin shape with Q/magnifier -->
    <g>
      <!-- Pin body -->
      <path
        d="M44 8C31.85 8 22 17.85 22 30C22 44 44 64 44 64C44 64 66 44 66 30C66 17.85 56.15 8 44 8Z"
        fill="currentColor"
        class="logo-pin"
      />
      <!-- Inner circle (white) -->
      <circle cx="44" cy="30" r="12" fill="white" />
      <!-- Search line (magnifier handle) -->
      <line x1="52" y1="38" x2="58" y2="44" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" class="logo-pin" />
    </g>
  </svg>
</template>

<script setup>
defineProps({
  size: {
    type: Number,
    default: 48
  }
})
</script>

<style scoped>
.logo-pin {
  fill: var(--gm-red);
  stroke: var(--gm-red);
}
svg {
  color: var(--gm-red);
}
</style>
