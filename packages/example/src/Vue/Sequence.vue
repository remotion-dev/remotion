<script setup lang="ts">
import {computed, inject, onBeforeUnmount, onMounted, ref, Ref} from "vue"

import { useVideoConfig } from "./use-video-config"
import { TNonceContext,TimelineContextValue, SequenceContextType, CompositionManagerContext, Internals } from "remotion"
import { SequenceProps } from "remotion/dist/sequencing"
import { useCurrentFrame } from "./use-current-frame"


const props = defineProps({
  from: {
    type: Number,
    required: true
  },
  durationInFrames: Number,
  name: String,
  showInTimeline: Boolean,
  showLoopTimesInTimeline: Number,
  layout: String,
})
const from = props.from as number
const name = props.name as string | undefined
const durationInFrames = (props.durationInFrames as number | undefined) ?? Infinity
const layout = (props.layout as 'absolute-fill' | 'none') ?? 'absolute-fill'
const showLoopTimesInTimeline = props.showLoopTimesInTimeline as (number | undefined)
// TODO: Derive default from Remotion
const showInTimeline = (props.showInTimeline as boolean | undefined) ?? true 
Internals.validateSequenceProps({
  children: null,
  from,
  durationInFrames: durationInFrames,
  name,
layout,
showInTimeline,
showLoopTimesInTimeline
})
const id = ref(String(Math.random()))
const {value: parentSequence} = inject('remotion.sequenceContext') as Ref<SequenceContextType | null> 
const timelineContext = inject('remotion.timelineContext') as Ref<TimelineContextValue >
const nonceContext = inject('remotion.nonceContext') as Ref<TNonceContext >
const compositionManager = inject('remotion.compositionManager') as Ref<CompositionManagerContext >
const nonce = nonceContext.value.getNonce()

const rootId = timelineContext.value.rootId
	const cumulatedFrom = parentSequence
		? parentSequence.cumulatedFrom + parentSequence.relativeFrom
		: 0;
const actualFrom = cumulatedFrom + from;
// TODO: Need to implement unsafe video config?
	const actualDurationInFrames = Math.min(
		durationInFrames - from,
		parentSequence
			? Math.min(
					parentSequence.durationInFrames +
						(parentSequence.cumulatedFrom + parentSequence.relativeFrom) -
						actualFrom,
					durationInFrames
			  )
			: durationInFrames
	);
const {registerSequence, unregisterSequence} = compositionManager.value
const contextValue: SequenceContextType = {
  cumulatedFrom,
  relativeFrom: from,
  parentFrom: parentSequence?.relativeFrom ?? 0,
  durationInFrames: actualDurationInFrames,
  id: id.value
}
// TODO: Inspect children
const timelineClipName = name ?? Internals.getTimelineClipName(null)

onMounted(() => {
  registerSequence({
			from,
			duration: actualDurationInFrames,
			id: id.value,
			displayName: timelineClipName,
			parent: parentSequence?.id ?? null,
			type: 'sequence',
			rootId,
			showInTimeline: showInTimeline,
			nonce,
			showLoopTimesInTimeline,
		});
})
onBeforeUnmount(() => {
  unregisterSequence(id.value)
})
const endThreshold =  actualFrom + durationInFrames - 1;
const shouldRender = computed(() => {
  const absoluteFrame = timelineContext.value.frame
  return  absoluteFrame < actualFrom
      ? false
      : absoluteFrame > endThreshold
      ? false
      : true;
})
</script>


<template>
  <div class="container">
    <div v-if="shouldRender && layout === 'absolute-fill'" class="remotion__absolute">
      <slot></slot>
    </div>
    <slot v-if="shouldRender && layout !== 'absolute-fill'"></slot>
  </div>
</template>

<style scoped>
.remotion__absolute-fill {
  position: absolute ;
  display: flex;
  width: 100%;
  height: 100%;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0
}
</style>
