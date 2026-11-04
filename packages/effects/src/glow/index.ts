import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	parseColorRgba,
	validateNonNegative,
	validateUnitInterval,
} from '../color-utils.js';
import {GAUSSIAN_BLUR_WEBGPU_SHADER} from '../gaussian-blur-webgpu-shader.js';
import {
	assertEffectParamsObject,
	assertOptionalColor,
} from '../validate-effect-param.js';
import {
	applyWebGpuMultipass,
	cleanupWebGpuMultipass,
	setupWebGpuMultipass,
	type WebGpuMultipassState,
} from '../webgpu-multipass-runtime.js';
import {
	applyGlow,
	cleanupGlow,
	setupGlow,
	type GlowState,
} from './glow-runtime.js';
import {
	GLOW_EXTRACT_WEBGPU_SHADER,
	GLOW_COMPOSITE_WEBGPU_SHADER,
} from './webgpu-shaders.js';

const {createEffect} = Internals;

const DEFAULT_RADIUS = 20 as const;
const DEFAULT_INTENSITY = 1 as const;
const DEFAULT_THRESHOLD = 0 as const;
const DEFAULT_COLOR = '#ffffff' as const;

const glowSchema = {
	radius: {
		type: 'number',
		min: 0,
		max: 100,
		step: 1,
		default: DEFAULT_RADIUS,
		description: 'Radius',
		hiddenFromList: false,
	},
	intensity: {
		type: 'number',
		min: 0,
		max: 5,
		step: 0.1,
		default: DEFAULT_INTENSITY,
		description: 'Intensity',
		hiddenFromList: false,
	},
	threshold: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_THRESHOLD,
		description: 'Threshold',
		hiddenFromList: false,
	},
	color: {
		type: 'color',
		default: DEFAULT_COLOR,
		description: 'Color',
	},
} as const satisfies InteractivitySchema;

export type GlowParams = {
	/** Blur radius of the glow in pixels. Defaults to `20`. */
	readonly radius?: number;
	/** Brightness multiplier for the glow. Defaults to `1`. */
	readonly intensity?: number;
	/** Luminance threshold from `0` to `1`. Defaults to `0`. */
	readonly threshold?: number;
	/** Color of the glow. Defaults to white. */
	readonly color?: string;
};

type GlowResolved = {
	readonly radius: number;
	readonly intensity: number;
	readonly threshold: number;
	readonly color: string;
};

const resolve = (p: GlowParams): GlowResolved => ({
	radius: p.radius ?? DEFAULT_RADIUS,
	intensity: p.intensity ?? DEFAULT_INTENSITY,
	threshold: p.threshold ?? DEFAULT_THRESHOLD,
	color: p.color ?? DEFAULT_COLOR,
});

const validateGlowParams = (params: GlowParams): void => {
	assertEffectParamsObject(params, 'Glow');
	assertOptionalFiniteNumber(params.radius, 'radius');
	assertOptionalFiniteNumber(params.intensity, 'intensity');
	assertOptionalFiniteNumber(params.threshold, 'threshold');
	assertOptionalColor(params.color, 'color');

	const r = resolve(params);
	validateNonNegative(r.radius, 'radius');
	validateNonNegative(r.intensity, 'intensity');
	validateUnitInterval(r.threshold, 'threshold');
};

export const glow = createEffect<GlowParams>({
	type: 'dev.remotion.effects.glow',
	label: 'glow()',
	documentationLink: 'https://www.remotion.dev/docs/effects/glow',
	calculateKey: (params) => {
		const r = resolve(params);
		return `glow-${r.radius}-${r.intensity}-${r.threshold}-${r.color}`;
	},
	implementations: {
		webgpu: Internals.createEffectImplementation<
			GlowParams,
			WebGpuMultipassState & {
				readonly colorCtx: CanvasRenderingContext2D;
				cachedColor: string | null;
				cachedRgba: ReturnType<typeof parseColorRgba>;
			}
		>({
			setup: (target) => {
				const canvas = document.createElement('canvas');
				canvas.width = 1;
				canvas.height = 1;
				const colorCtx = canvas.getContext('2d', {willReadFrequently: true});
				if (!colorCtx) throw new Error('Could not create color parser');
				return {
					...setupWebGpuMultipass(target, 'glow'),
					colorCtx,
					cachedColor: null,
					cachedRgba: [0, 0, 0, 0],
				};
			},
			apply: ({source, width, height, params, state, gpuDevice}) => {
				if (!gpuDevice)
					throw new Error('A WebGPU device is required for this effect');
				const r = resolve(params);
				if (state.cachedColor !== r.color) {
					state.cachedColor = r.color;
					state.cachedRgba = parseColorRgba(state.colorCtx, r.color);
				}

				const color = state.cachedRgba.map((channel) => channel / 255);
				applyWebGpuMultipass({
					auxiliarySource: null,
					state,
					source,
					width,
					height,
					device: gpuDevice as GPUDevice,
					passes: [
						{
							shader: GLOW_EXTRACT_WEBGPU_SHADER,
							uniforms: new Float32Array([...color, r.threshold, 0, 0, 0]),
							source: -1,
							secondary: -1,
						},
						{
							shader: GAUSSIAN_BLUR_WEBGPU_SHADER,
							uniforms: new Float32Array([
								width,
								height,
								1,
								0,
								r.radius,
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
						{
							shader: GAUSSIAN_BLUR_WEBGPU_SHADER,
							uniforms: new Float32Array([
								width,
								height,
								0,
								1,
								r.radius,
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
							source: 1,
							secondary: -1,
						},
						{
							shader: GLOW_COMPOSITE_WEBGPU_SHADER,
							uniforms: new Float32Array([r.intensity, 0, 0, 0]),
							source: -1,
							secondary: 2,
						},
					],
				});
			},
			cleanup: cleanupWebGpuMultipass,
		}),
		webgl2: Internals.createEffectImplementation<GlowParams, GlowState>({
			setup: (target) => setupGlow(target),
			apply: ({source, width, height, params, state, flipSourceY}) => {
				const r = resolve(params);

				if (state.cachedColorStr !== r.color) {
					state.cachedColorStr = r.color;
					state.cachedColorRgba = parseColorRgba(state.colorCtx, r.color);
				}

				applyGlow({
					state,
					source,
					width,
					height,
					radius: r.radius,
					intensity: r.intensity,
					threshold: r.threshold,
					color: state.cachedColorRgba,
					flipSourceY,
				});
			},
			cleanup: (state) => cleanupGlow(state),
		}),
	},
	schema: glowSchema,
	validateParams: validateGlowParams,
});
