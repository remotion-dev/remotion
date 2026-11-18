import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateNonNegative,
	validateUnitInterval,
} from './color-utils.js';
import {MAGNIFY_FRAGMENT_SHADER} from './magnify/shader.js';
import {MAGNIFY_WEBGPU_SHADER} from './magnify/webgpu-shader.js';
import {
	cleanupSinglePass,
	drawSinglePass,
	prepareSinglePassSource,
	setupSinglePass,
	type SinglePassState,
} from './single-pass-runtime.js';
import {
	assertEffectParamsObject,
	assertRequiredFiniteNumber,
} from './validate-effect-param.js';
import {
	applyWebGpuSinglePass,
	cleanupWebGpuSinglePass,
	setupWebGpuSinglePass,
	type WebGpuSinglePassState,
} from './webgpu-single-pass-runtime.js';

const DEFAULT_SHAPE = 'circle' as const;
const DEFAULT_CENTER = [0.5, 0.5] as const;
const DEFAULT_MAGNIFICATION = 200 as const;
const DEFAULT_LINK = 'none' as const;
const DEFAULT_SIZE = 100 as const;
const DEFAULT_FEATHER = 0 as const;
const DEFAULT_OPACITY = 1 as const;
const DEFAULT_SCALING = 'standard' as const;
const DEFAULT_BLENDING_MODE = 'normal' as const;

export type MagnifyCenter = readonly [number, number];
export type MagnifyShape = 'circle' | 'square';
export type MagnifyLink = 'none' | 'size' | 'size-and-feather';
export type MagnifyScaling = 'standard' | 'soft' | 'scatter';
export type MagnifyBlendingMode = 'normal' | 'none';

export type MagnifyParams = {
	/** Shape of the magnified area. Defaults to `circle`. */
	readonly shape?: MagnifyShape;
	/** Center in normalized coordinates from the top-left. Defaults to `[0.5, 0.5]`. */
	readonly center?: MagnifyCenter;
	/** Scale as a percentage, where `100` leaves the source unchanged. Defaults to `200`. */
	readonly magnification?: number;
	/** Link size, or size and feather, to magnification. Defaults to `none`. */
	readonly link?: MagnifyLink;
	/** Radius, or half the square's side length, in pixels. Defaults to `100`. */
	readonly size?: number;
	/** Width of the inward feather in pixels. Defaults to `0`. */
	readonly feather?: number;
	/** Strength from `0` to `1`. Defaults to `1`. */
	readonly opacity?: number;
	/** Nearest-pixel, bicubic, or scattered sampling. Defaults to `standard`. */
	readonly scaling?: MagnifyScaling;
	/** Blend with the source, or show only the magnified area. Defaults to `normal`. */
	readonly blendingMode?: MagnifyBlendingMode;
};

const magnifySchema = {
	shape: {
		type: 'enum',
		variants: {circle: {}, square: {}},
		default: DEFAULT_SHAPE,
		description: 'Shape',
	},
	center: {
		type: 'uv-coordinate',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_CENTER,
		description: 'Center',
	},
	magnification: {
		type: 'number',
		min: 1,
		max: 10000,
		step: 1,
		default: DEFAULT_MAGNIFICATION,
		description: 'Magnification (%)',
		hiddenFromList: false,
	},
	link: {
		type: 'enum',
		variants: {none: {}, size: {}, 'size-and-feather': {}},
		default: DEFAULT_LINK,
		description: 'Link',
	},
	size: {
		type: 'number',
		min: 0,
		max: 4000,
		step: 1,
		default: DEFAULT_SIZE,
		description: 'Size',
		hiddenFromList: false,
	},
	feather: {
		type: 'number',
		min: 0,
		max: 4000,
		step: 1,
		default: DEFAULT_FEATHER,
		description: 'Feather',
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
	scaling: {
		type: 'enum',
		variants: {standard: {}, soft: {}, scatter: {}},
		default: DEFAULT_SCALING,
		description: 'Scaling',
	},
	blendingMode: {
		type: 'enum',
		variants: {normal: {}, none: {}},
		default: DEFAULT_BLENDING_MODE,
		description: 'Blending mode',
	},
} as const satisfies InteractivitySchema;

const resolve = (params: MagnifyParams): Required<MagnifyParams> => ({
	shape: params.shape ?? DEFAULT_SHAPE,
	center: params.center ?? DEFAULT_CENTER,
	magnification: params.magnification ?? DEFAULT_MAGNIFICATION,
	link: params.link ?? DEFAULT_LINK,
	size: params.size ?? DEFAULT_SIZE,
	feather: params.feather ?? DEFAULT_FEATHER,
	opacity: params.opacity ?? DEFAULT_OPACITY,
	scaling: params.scaling ?? DEFAULT_SCALING,
	blendingMode: params.blendingMode ?? DEFAULT_BLENDING_MODE,
});

export const magnify = Internals.createEffect<MagnifyParams>({
	type: 'dev.remotion.effects.magnify',
	label: 'magnify()',
	documentationLink: 'https://www.remotion.dev/docs/effects/magnify',
	calculateKey: (params) => {
		const r = resolve(params);
		return `magnify-${r.shape}-${r.center.join(':')}-${r.magnification}-${r.link}-${r.size}-${r.feather}-${r.opacity}-${r.scaling}-${r.blendingMode}`;
	},
	implementations: {
		webgl2: Internals.createEffectImplementation<
			MagnifyParams,
			SinglePassState
		>({
			setup: (target) =>
				setupSinglePass(target, MAGNIFY_FRAGMENT_SHADER, 'magnify', [
					'uResolution',
					'uCenter',
					'uMagnification',
					'uSize',
					'uFeather',
					'uOpacity',
					'uSquare',
					'uScaling',
					'uIsolated',
				]),
			apply: ({source, width, height, params, state, flipSourceY}) => {
				const r = resolve(params);
				const scale = r.magnification / 100;
				const {gl, uniforms} = state;
				prepareSinglePassSource({
					state,
					source: source as TexImageSource,
					width,
					height,
					flipSourceY,
				});
				gl.uniform2f(uniforms.uResolution, width, height);
				gl.uniform2f(uniforms.uCenter, r.center[0], r.center[1]);
				gl.uniform1f(uniforms.uMagnification, scale);
				gl.uniform1f(uniforms.uSize, r.size * (r.link === 'none' ? 1 : scale));
				gl.uniform1f(
					uniforms.uFeather,
					r.feather * (r.link === 'size-and-feather' ? scale : 1),
				);
				gl.uniform1f(uniforms.uOpacity, r.opacity);
				gl.uniform1i(uniforms.uSquare, r.shape === 'square' ? 1 : 0);
				gl.uniform1i(
					uniforms.uScaling,
					['standard', 'soft', 'scatter'].indexOf(r.scaling),
				);
				gl.uniform1i(uniforms.uIsolated, r.blendingMode === 'none' ? 1 : 0);
				drawSinglePass(state);
			},
			cleanup: cleanupSinglePass,
		}),
		webgpu: Internals.createEffectImplementation<
			MagnifyParams,
			WebGpuSinglePassState
		>({
			setup: (target) => setupWebGpuSinglePass(target, 'magnify'),
			apply: ({source, width, height, params, state, gpuDevice}) => {
				if (!gpuDevice) {
					throw new Error('A WebGPU device is required for the magnify effect');
				}

				const r = resolve(params);
				const scale = r.magnification / 100;
				applyWebGpuSinglePass({
					state,
					source,
					width,
					height,
					device: gpuDevice as GPUDevice,
					shader: MAGNIFY_WEBGPU_SHADER,
					uniformData: new Float32Array([
						width,
						height,
						r.center[0],
						r.center[1],
						scale,
						r.size * (r.link === 'none' ? 1 : scale),
						r.feather * (r.link === 'size-and-feather' ? scale : 1),
						r.opacity,
						r.shape === 'square' ? 1 : 0,
						['standard', 'soft', 'scatter'].indexOf(r.scaling),
						r.blendingMode === 'none' ? 1 : 0,
						0,
					]),
				});
			},
			cleanup: cleanupWebGpuSinglePass,
		}),
	},
	schema: magnifySchema,
	validateParams: (params) => {
		assertEffectParamsObject(params, 'Magnify');
		for (const name of [
			'magnification',
			'size',
			'feather',
			'opacity',
		] as const) {
			assertOptionalFiniteNumber(params[name], name);
		}

		if (params.center !== undefined) {
			if (!Array.isArray(params.center) || params.center.length !== 2) {
				throw new TypeError('"center" must be a [number, number] tuple');
			}

			assertRequiredFiniteNumber(params.center[0], 'center[0]');
			assertRequiredFiniteNumber(params.center[1], 'center[1]');
		}

		const r = resolve(params);
		validateUnitInterval(r.center[0], 'center[0]');
		validateUnitInterval(r.center[1], 'center[1]');
		if (r.magnification < 1 || r.magnification > 10000) {
			throw new TypeError('"magnification" must be between 1 and 10000');
		}

		validateNonNegative(r.size, 'size');
		validateNonNegative(r.feather, 'feather');
		validateUnitInterval(r.opacity, 'opacity');
		for (const name of ['shape', 'link', 'scaling', 'blendingMode'] as const) {
			if (!Object.hasOwn(magnifySchema[name].variants, r[name])) {
				throw new TypeError(`Invalid "${name}": ${JSON.stringify(r[name])}`);
			}
		}
	},
});
