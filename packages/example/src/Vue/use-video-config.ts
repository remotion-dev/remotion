import {ref, onMounted, onUnmounted, inject} from 'vue';

export const useVideoConfig = () => {
	const fps = inject('remotion.fps');
	const durationInFrames = inject('remotion.durationInFrames');
	const width = inject('remotion.width');
	const height = inject('remotion.height');

	return {fps, durationInFrames, width, height};
};
