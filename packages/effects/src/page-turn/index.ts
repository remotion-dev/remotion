import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	parseColorRgba,
	validateUnitInterval,
	type ParsedColorRgba,
} from '../color-utils.js';
import {
	assertEffectParamsObject,
	assertOptionalColor,
} from '../validate-effect-param.js';
import {
	applyWebGpuProjection,
	cleanupWebGpuProjection,
	setupWebGpuProjection,
	type WebGpuProjectionState,
} from '../webgpu-projection-runtime.js';
import {PAGE_TURN_SHADER} from './shader.js';

const DEFAULT_FOLD_POSITION = [0.7, 0.7] as const;
const DEFAULT_FOLD_DIRECTION = 315;
const DEFAULT_FOLD_RADIUS = 60;
const DEFAULT_LIGHT_DIRECTION = -45;
const DEFAULT_RENDER = 'both';
const DEFAULT_BACK_PAGE_OPACITY = 0.25;
const DEFAULT_PAPER_COLOR = '#ffffff';

const pageTurnSchema = {
	foldPosition: {
		type: 'uv-coordinate',
		default: DEFAULT_FOLD_POSITION,
		description: 'Fold position',
	},
	foldDirection: {
		type: 'rotation-degrees',
		default: DEFAULT_FOLD_DIRECTION,
		description: 'Fold direction',
	},
	foldRadius: {
		type: 'number',
		min: 1,
		max: 500,
		step: 1,
		default: DEFAULT_FOLD_RADIUS,
		description: 'Fold radius',
		hiddenFromList: false,
	},
	lightDirection: {
		type: 'rotation-degrees',
		default: DEFAULT_LIGHT_DIRECTION,
		description: 'Light direction',
	},
	render: {
		type: 'enum',
		variants: {both: {}, front: {}, back: {}},
		default: DEFAULT_RENDER,
		description: 'Faces',
	},
	backPageOpacity: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_BACK_PAGE_OPACITY,
		description: 'Back image opacity',
		hiddenFromList: false,
	},
	paperColor: {
		type: 'color',
		default: DEFAULT_PAPER_COLOR,
		description: 'Paper color',
	},
} as const satisfies InteractivitySchema;

export type PageTurnRender = 'both' | 'front' | 'back';

export type PageTurnParams = {
	/** Position of the fold as fractions of the canvas size. Defaults to [0.7, 0.7]. */
	readonly foldPosition?: readonly [number, number];
	/** Angle of the fold line in degrees. Defaults to 315. */
	readonly foldDirection?: number;
	/** Curl radius in pixels. Must be greater than zero. Defaults to 60. */
	readonly foldRadius?: number;
	/** Direction of the light in degrees. Defaults to -45. */
	readonly lightDirection?: number;
	/** Which faces to show. Defaults to 'both'. */
	readonly render?: PageTurnRender;
	/** Visibility of the source image on the back, from 0 to 1. Defaults to 0.25. */
	readonly backPageOpacity?: number;
	/** Color of the paper back. Defaults to white. */
	readonly paperColor?: string;
};

type PageTurnState = WebGpuProjectionState & {
	colorCtx: CanvasRenderingContext2D;
	cachedColor: string | null;
	cachedRgba: ParsedColorRgba;
};

const resolve = (params: PageTurnParams) => ({
	foldPosition: params.foldPosition ?? DEFAULT_FOLD_POSITION,
	foldDirection: params.foldDirection ?? DEFAULT_FOLD_DIRECTION,
	foldRadius: params.foldRadius ?? DEFAULT_FOLD_RADIUS,
	lightDirection: params.lightDirection ?? DEFAULT_LIGHT_DIRECTION,
	render: params.render ?? DEFAULT_RENDER,
	backPageOpacity: params.backPageOpacity ?? DEFAULT_BACK_PAGE_OPACITY,
	paperColor: params.paperColor ?? DEFAULT_PAPER_COLOR,
});

export const pageTurn = Internals.createEffect<PageTurnParams, PageTurnState>({
	type: 'remotion/page-turn',
	label: 'pageTurn()',
	documentationLink: 'https://www.remotion.dev/docs/effects/page-turn',
	backend: 'webgpu',
	schema: pageTurnSchema,
	validateParams: (params) => {
		assertEffectParamsObject(params, 'Page turn');
		for (const key of [
			'foldDirection',
			'foldRadius',
			'lightDirection',
			'backPageOpacity',
		] as const) {
			assertOptionalFiniteNumber(params[key], key);
		}

		assertOptionalColor(params.paperColor, 'paperColor');
		const r = resolve(params);
		if (r.foldRadius <= 0)
			throw new TypeError('"foldRadius" must be greater than 0');
		validateUnitInterval(r.backPageOpacity, 'backPageOpacity');
		if (
			params.foldPosition !== undefined &&
			(!Array.isArray(params.foldPosition) ||
				params.foldPosition.length !== 2 ||
				!Number.isFinite(params.foldPosition[0]) ||
				!Number.isFinite(params.foldPosition[1]))
		) {
			throw new TypeError('"foldPosition" must contain two finite numbers');
		}

		if (
			params.render !== undefined &&
			params.render !== 'both' &&
			params.render !== 'front' &&
			params.render !== 'back'
		) {
			throw new TypeError('"render" must be "both", "front", or "back"');
		}
	},
	calculateKey: (params) => {
		const r = resolve(params);
		return `page-turn-${r.foldPosition.join(',')}-${r.foldDirection}-${r.foldRadius}-${r.lightDirection}-${r.render}-${r.backPageOpacity}-${r.paperColor}`;
	},
	setup: (target) => {
		const colorCanvas = document.createElement('canvas');
		colorCanvas.width = 1;
		colorCanvas.height = 1;
		const colorCtx = colorCanvas.getContext('2d', {willReadFrequently: true});
		if (!colorCtx)
			throw new Error('Could not create the page turn color context');
		return {
			...setupWebGpuProjection(target, 'page turn'),
			colorCtx,
			cachedColor: null,
			cachedRgba: [255, 255, 255, 255],
		};
	},
	apply: ({source, width, height, params, state, gpuDevice}) => {
		if (!gpuDevice)
			throw new Error('A WebGPU device is required for the page turn effect');
		const r = resolve(params);
		if (state.cachedColor !== r.paperColor) {
			state.cachedColor = r.paperColor;
			state.cachedRgba = parseColorRgba(state.colorCtx, r.paperColor);
		}

		const radians = Math.PI / 180;
		applyWebGpuProjection({
			source,
			width,
			height,
			state,
			device: gpuDevice as GPUDevice,
			shader: PAGE_TURN_SHADER,
			uniformData: new Float32Array([
				width,
				height,
				r.foldPosition[0] * width,
				r.foldPosition[1] * height,
				r.foldRadius,
				(r.foldDirection % 360) * radians,
				(r.lightDirection % 360) * radians,
				r.render === 'front' ? 1 : r.render === 'back' ? 2 : 0,
				...state.cachedRgba.map((channel) => channel / 255),
				r.backPageOpacity,
				0,
				0,
				0,
			]),
		});
	},
	cleanup: cleanupWebGpuProjection,
});
