<script setup>
import { provide, ref } from 'vue'
import App from './App.vue'
const props = defineProps(['fps', 'frame', 'width', 'height', 'durationInFrames'])
provide('remotion.fps', props.fps)
provide('remotion.width', props.width)
provide('remotion.height', props.height)
provide('remotion.durationInFrames', props.durationInFrames)
provide('remotion.frame', props.frame)
</script>

<template>
  <div>
    <App />  
  </div>
</template>
