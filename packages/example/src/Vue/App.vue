<script setup lang="ts">
import {inject} from "vue"
const {width, height, fps, durationInFrames} = useVideoConfig()
const frame = useCurrentFrame()
import { useVideoConfig } from "./use-video-config"
import { useCurrentFrame } from "./use-current-frame"
import Sequence from './Sequence.vue'
</script>

<template>
  <div class="container">
    <div>Frame: {{ frame }}</div>
    <div>Width: {{ width }}</div>
    <div>Height: {{ height }}</div>
    <div>Duration: {{ durationInFrames }}</div>
    <div>FPS: {{ fps }}</div>
    <Sequence></Sequence>
  </div>
</template>

<style scoped>
button {
  font-weight: bold;
  font-size: 100px;
}
.container {
  font-size: 50px;
  font-family: sans-serif;
}
</style>
