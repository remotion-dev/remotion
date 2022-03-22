<script setup lang="ts">
import { useCurrentFrame } from "./use-current-frame"
const frame = useCurrentFrame()
</script>

<template>
  <div class="container">
    <div>Child: {{ frame }}</div>
  </div>
</template>

<style scoped>
.container {
  font-size: 50px;
  font-family: sans-serif;
}
</style>
