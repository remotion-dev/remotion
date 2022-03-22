import {ref, onMounted, onUnmounted, inject} from 'vue';

export const useCurrentFrame = () => {
	const frame = inject('remotion.frame');

	return frame;
};
