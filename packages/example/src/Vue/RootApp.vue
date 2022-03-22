<script setup>
import {provide, ref} from 'vue';
import App from './App.vue';
const props = defineProps([
	'fps',
	'frame',
	'width',
	'height',
	'durationInFrames',
	'sequenceContext',
	'timelineContext',
	'nonceContext',
	'compositionManager',
]);
provide('remotion.fps', props.fps);
provide('remotion.width', props.width);
provide('remotion.height', props.height);
provide('remotion.durationInFrames', props.durationInFrames);
provide('remotion.frame', props.frame);
provide('remotion.sequenceContext', props.sequenceContext);
provide('remotion.timelineContext', props.timelineContext);
provide('remotion.nonceContext', props.nonceContext);
provide('remotion.compositionManager', props.compositionManager);
</script>

<template>
	<div>
		<App />
	</div>
</template>
