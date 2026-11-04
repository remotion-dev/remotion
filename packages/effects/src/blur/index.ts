import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {GAUSSIAN_BLUR_WEBGPU_SHADER} from '../gaussian-blur-webgpu-shader.js';
import {
	assertEffectParamsObject,
	assertRequiredFiniteNumber,
} from '../validate-effect-param.js';
import {
	applyWebGpuMultipass,
	cleanupWebGpuMultipass,
	setupWebGpuMultipass,
	type WebGpuMultipassState,
} from '../webgpu-multipass-runtime.js';
import {
	applyBlur,
	cleanupBlur,
	setupBlur,
	type BlurState,
} from './blur-runtime.js';

const {createEffect} = Internals;

export type BlurParams = {
	readonly radius: number;
	/** Apply blur along the horizontal axis. Defaults to `true`. */
	readonly horizontal?: boolean;
	/** Apply blur along the vertical axis. Defaults to `true`. */
	readonly vertical?: boolean;
};

type BlurResolved = {
	readonly radius: number;
	readonly horizontal: boolean;
	readonly vertical: boolean;
};

const resolveBlurParams = (params: BlurParams): BlurResolved => ({
	radius: params.radius,
	horizontal: params.horizontal ?? true,
	vertical: params.vertical ?? true,
});

const blurSchema = {
	radius: {
		type: 'number',
		min: 0,
		max: 100,
		step: 1,
		default: 40,
		description: 'Radius',
		hiddenFromList: false,
	},
	horizontal: {
		type: 'boolean',
		default: true,
		description: 'Horizontal',
	},
	vertical: {
		type: 'boolean',
		default: true,
		description: 'Vertical',
	},
} as const satisfies InteractivitySchema;

const validateBlurParams = (params: BlurParams): void => {
	assertEffectParamsObject(params, 'Blur');
	assertRequiredFiniteNumber(params.radius, 'radius');
};

export const blur = createEffect<BlurParams>({
	type: 'dev.remotion.effects.blur',
	label: 'blur()',
	documentationLink: 'https://www.remotion.dev/docs/effects/blur',
	calculateKey: (params) => {
		const r = resolveBlurParams(params);
		return `${r.radius}-${r.horizontal ? 1 : 0}-${r.vertical ? 1 : 0}`;
	},
	implementations: {
		webgpu: Internals.createEffectImplementation<
			BlurParams,
			WebGpuMultipassState
		>({
			setup: (target) => setupWebGpuMultipass(target, 'blur'),
			apply: ({source, width, height, params, state, gpuDevice}) => {
				if (!gpuDevice)
					throw new Error('A WebGPU device is required for this effect');
				const r = resolveBlurParams(params);

				applyWebGpuMultipass({
					auxiliarySource: null,
					state,
					source,
					width,
					height,
					device: gpuDevice as GPUDevice,
					passes: [
						{
							shader: GAUSSIAN_BLUR_WEBGPU_SHADER,
							uniforms: new Float32Array([
								width,
								height,
								1,
								0,
								r.horizontal ? r.radius : 0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
							]),
							source: -1,
							secondary: -1,
						},
						{
							shader: GAUSSIAN_BLUR_WEBGPU_SHADER,
							uniforms: new Float32Array([
								width,
								height,
								0,
								1,
								r.vertical ? r.radius : 0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
							]),
							source: 0,
							secondary: -1,
						},
					],
				});
			},
			cleanup: cleanupWebGpuMultipass,
		}),
		webgl2: Internals.createEffectImplementation<BlurParams, BlurState>({
			setup: (target) => setupBlur(target),
			apply: ({source, width, height, params, state, flipSourceY}) => {
				const r = resolveBlurParams(params);
				applyBlur({
					state,
					source,
					width,
					height,
					radius: r.radius,
					horizontal: r.horizontal,
					vertical: r.vertical,
					flipSourceY,
				});
			},
			cleanup: (state) => cleanupBlur(state),
		}),
	},
	schema: blurSchema,
	validateParams: validateBlurParams,
});
