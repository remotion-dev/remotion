<script setup lang="ts">
import {inject, Ref} from "vue"

import { useVideoConfig } from "./use-video-config"
import { useCurrentFrame } from "./use-current-frame"
import { SequenceContextType } from "remotion/dist/sequencing"
import { TimelineContextValue } from "remotion/src"

const {width, height, fps, durationInFrames} = useVideoConfig()
const frame = useCurrentFrame()

const props = defineProps(['from'])
const from = props.from as number
const id = Math.random()
const {value: parentSequence} = inject('remotion.sequenceContext') as Ref<SequenceContextType | null> 
const timelineContext = inject('remotion.timelineContext') as Ref<TimelineContextValue >

const rootId = timelineContext.value.rootId
	const cumulatedFrom = parentSequence
		? parentSequence.cumulatedFrom + parentSequence.relativeFrom
		: 0;
const actualFrom = cumulatedFrom + from;
console.log('pass')
</script>

<template>
  <div class="container">
    <div>From: {{ frame }}</div>

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
