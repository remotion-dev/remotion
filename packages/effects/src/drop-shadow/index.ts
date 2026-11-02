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
	applyDropShadow,
	cleanupDropShadow,
	setupDropShadow,
	type DropShadowState,
} from './drop-shadow-runtime.js';
import {
	DROP_SHADOW_EXTRACT_WEBGPU_SHADER,
	DROP_SHADOW_COMPOSITE_WEBGPU_SHADER,
} from './webgpu-shaders.js';

const {createEffect} = Internals;

const DEFAULT_RADIUS = 12 as const;
const DEFAULT_OFFSET_X = 8 as const;
const DEFAULT_OFFSET_Y = 8 as const;
const DEFAULT_OPACITY = 0.5 as const;
const DEFAULT_COLOR = '#000000' as const;

const dropShadowSchema = {
	radius: {
		type: 'number',
		min: 0,
		max: 100,
		step: 1,
		default: DEFAULT_RADIUS,
		description: 'Radius',
		hiddenFromList: false,
	},
	offsetX: {
		type: 'number',
		step: 1,
		default: DEFAULT_OFFSET_X,
		description: 'Offset X',
		hiddenFromList: false,
	},
	offsetY: {
		type: 'number',
		step: 1,
		default: DEFAULT_OFFSET_Y,
		description: 'Offset Y',
		hiddenFromList: false,
	},
	opacity: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_OPACITY,
		description: 'Opacity',
		hiddenFromList: false,
	},
	color: {
		type: 'color',
		default: DEFAULT_COLOR,
		description: 'Color',
	},
} as const satisfies InteractivitySchema;

export type DropShadowParams = {
	/** Blur radius of the shadow in pixels. Defaults to `12`. */
	readonly radius?: number;
	/** Horizontal shadow offset in pixels. Defaults to `8`. */
	readonly offsetX?: number;
	/** Vertical shadow offset in pixels. Defaults to `8`. */
	readonly offsetY?: number;
	/** Shadow opacity from `0` to `1`. Defaults to `0.5`. */
	readonly opacity?: number;
	/** Color of the shadow. Defaults to black. */
	readonly color?: string;
};

type DropShadowResolved = {
	readonly radius: number;
	readonly offsetX: number;
	readonly offsetY: number;
	readonly opacity: number;
	readonly color: string;
};

const resolve = (p: DropShadowParams): DropShadowResolved => ({
	radius: p.radius ?? DEFAULT_RADIUS,
	offsetX: p.offsetX ?? DEFAULT_OFFSET_X,
	offsetY: p.offsetY ?? DEFAULT_OFFSET_Y,
	opacity: p.opacity ?? DEFAULT_OPACITY,
	color: p.color ?? DEFAULT_COLOR,
});

const validateDropShadowParams = (params: DropShadowParams): void => {
	assertEffectParamsObject(params, 'Drop shadow');
	assertOptionalFiniteNumber(params.radius, 'radius');
	assertOptionalFiniteNumber(params.offsetX, 'offsetX');
	assertOptionalFiniteNumber(params.offsetY, 'offsetY');
	assertOptionalFiniteNumber(params.opacity, 'opacity');
	assertOptionalColor(params.color, 'color');

	const r = resolve(params);
	validateNonNegative(r.radius, 'radius');
	validateUnitInterval(r.opacity, 'opacity');
};

export const dropShadow = createEffect<DropShadowParams>({
	type: 'dev.remotion.effects.dropShadow',
	label: 'dropShadow()',
	documentationLink: 'https://www.remotion.dev/docs/effects/drop-shadow',
	calculateKey: (params) => {
		const r = resolve(params);
		return `drop-shadow-${r.radius}-${r.offsetX}-${r.offsetY}-${r.opacity}-${r.color}`;
	},
	implementations: {
		webgpu: Internals.createEffectImplementation<
			DropShadowParams,
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
					...setupWebGpuMultipass(target, 'drop-shadow'),
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
							shader: DROP_SHADOW_EXTRACT_WEBGPU_SHADER,
							uniforms: new Float32Array([...color, r.opacity, 0, 0, 0]),
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
							shader: DROP_SHADOW_COMPOSITE_WEBGPU_SHADER,
							uniforms: new Float32Array([width, height, r.offsetX, r.offsetY]),
							source: -1,
							secondary: 2,
						},
					],
				});
			},
			cleanup: cleanupWebGpuMultipass,
		}),
		webgl2: Internals.createEffectImplementation<
			DropShadowParams,
			DropShadowState
		>({
			setup: (target) => setupDropShadow(target),
			apply: ({source, width, height, params, state, flipSourceY}) => {
				const r = resolve(params);

				if (state.cachedColorStr !== r.color) {
					state.cachedColorStr = r.color;
					state.cachedColorRgba = parseColorRgba(state.colorCtx, r.color);
				}

				applyDropShadow({
					state,
					source,
					width,
					height,
					radius: r.radius,
					offsetX: r.offsetX,
					offsetY: r.offsetY,
					opacity: r.opacity,
					color: state.cachedColorRgba,
					flipSourceY,
				});
			},
			cleanup: (state) => cleanupDropShadow(state),
		}),
	},
	schema: dropShadowSchema,
	validateParams: validateDropShadowParams,
});
