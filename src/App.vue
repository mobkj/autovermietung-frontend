<script setup>
import { computed } from 'vue'
import FooterInfo from './components/FooterInfo.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const hideFooter = computed(() => route.meta?.hideFooter)
</script>

<template>
  <router-view />
  <footer-info v-if="!hideFooter" />
</template>

<style>
:root {
  --mazari-primary: #06457f;
  --mazari-primary-dark: #032b4f;
  --mazari-accent: #f5b544;
  --mazari-bg-light: #f4f7fc;
  --mazari-text-dark: #0f172a;
  --mazari-radius-lg: 18px;
  --mazari-shadow-soft: 0 18px 45px rgba(15, 23, 42, 0.16);
  --mazari-shadow-subtle: 0 6px 18px rgba(15, 23, 42, 0.12);
}

/* ✅ Guardrails gegen seitliches Schwimmen */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body,
#app {
  min-height: 100dvh;
  width: 100%;
  margin: 0;
  overflow-x: hidden; /* ← killt das seitliche Wegfliegen global */
  font-family:
    'Inter',
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

/* Hintergrund */
body {
  background:
    radial-gradient(circle at 20% 0%, rgba(255, 255, 255, 0.95) 0, rgba(255, 255, 255, 0) 55%),
    radial-gradient(circle at 80% 0%, rgba(255, 255, 255, 0.9) 0, rgba(255, 255, 255, 0) 60%),
    linear-gradient(to bottom, #e6edf8 0%, #dde6f5 40%, #f3f6fc 75%, #ffffff 100%);
}

#app {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Medien niemals breiter als Screen */
img,
svg,
video,
canvas {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Links neutral */
a,
a:visited,
a:active,
a:hover {
  text-decoration: none;
  color: inherit;
}
</style>
