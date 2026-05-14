import {Internals} from 'remotion';

const {createEffect} = Internals;
import {
	applyBlur,
	cleanupBlur,
	setupBlur,
	type BlurState,
} from './blur-runtime.js';
import {BLUR_FS_VERTICAL} from './blur-shaders.js';

export type BlurVerticalParams = {
	readonly radius: number;
};

// Single vertical pass of the separable Gaussian blur. Most callers should
// use [`blur`](./index.ts) which composes both horizontal and vertical passes.
export const blurVertical = createEffect<BlurVerticalParams, BlurState>({
	type: 'remotion/blur-vertical',
	factoryName: 'blurVertical',
	label: 'Blur (vertical)',
	backend: 'webgl2',
	calculateKey: (params) => String(params.radius),
	setup: (target) => setupBlur(target, BLUR_FS_VERTICAL),
	apply: ({source, width, height, params, state}) => {
		applyBlur(state, source, width, height, params.radius);
	},
	cleanup: (state) => cleanupBlur(state),
	schema: null,
});
