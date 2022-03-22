import {ref, onMounted, onUnmounted, inject, Ref} from 'vue';

export const useVideoConfig = () => {
	const fps = inject('remotion.fps') as Ref<number>;
	const durationInFrames = inject('remotion.durationInFrames') as Ref<number>;
	const width = inject('remotion.width') as Ref<number>;
	const height = inject('remotion.height') as Ref<number>;

	return {fps, durationInFrames, width, height};
};
