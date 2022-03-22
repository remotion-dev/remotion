<script setup lang="ts">
import {inject} from "vue"
import { useCurrentFrame } from "./use-current-frame"
import { useVideoConfig } from "./use-video-config"
const {width, height, fps, durationInFrames} = useVideoConfig()
const frame = useCurrentFrame()
import Sequence from './Sequence.vue'
import Child from './Child.vue'
</script>

<template>
  <div class="container">
    <div>Frame: {{ frame }}</div>
    <div>Width: {{ width }}</div>
    <div>Height: {{ height }}</div>
    <div>Duration: {{ durationInFrames }}</div>
    <div>FPS: {{ fps }}</div>
    <Sequence :from="10" >
      <div>Woah</div>
      <Child></Child>
    </Sequence>
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
