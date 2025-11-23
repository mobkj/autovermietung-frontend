<script setup>
import FooterInfo from './components/FooterInfo.vue'
</script>
<template>
  <router-view />
  <footer-info />
</template>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
}

#app {
  display: flex;
  flex-direction: column;
}
</style>
