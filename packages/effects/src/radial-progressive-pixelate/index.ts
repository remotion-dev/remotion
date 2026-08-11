import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateNonNegative,
	validateUnitInterval,
} from '../color-utils.js';
import {
	cleanupProgressivePixelate,
	drawProgressivePixelate,
	prepareProgressivePixelate,
	setupProgressivePixelate,
	type ProgressivePixelateState,
} from '../progressive-pixelate-runtime.js';
import {assertEffectParamsObject} from '../validate-effect-param.js';

const {createEffect} = Internals;

const DEFAULT_CENTER = [0.5, 0.5] as const;
const DEFAULT_WIDTH = 1;
const DEFAULT_HEIGHT = 1;
const DEFAULT_ROTATION = 0;
const DEFAULT_START = 0;
const DEFAULT_START_BLOCK_SIZE = 1;
const DEFAULT_END_BLOCK_SIZE = 40;

export type RadialProgressivePixelateUvCoordinate = readonly [number, number];

export type RadialProgressivePixelateParams = {
	/** UV coordinate at the center of the ellipse. Defaults to `[0.5, 0.5]`. */
	readonly center?: RadialProgressivePixelateUvCoordinate;
	/** Full ellipse width in UV coordinates. Defaults to `1`. */
	readonly width?: number;
	/** Full ellipse height in UV coordinates. Defaults to `1`. */
	readonly height?: number;
	/** Ellipse rotation in degrees. Defaults to `0`. */
	readonly rotation?: number;
	/** Normalized ellipse progress where interpolation starts. Defaults to `0`. */
	readonly start?: number;
	/** Pixel block size at `start`. Defaults to `1`. */
	readonly startBlockSize?: number;
	/** Pixel block size at the outer ellipse. Defaults to `40`. */
	readonly endBlockSize?: number;
};

type RadialProgressivePixelateResolved = {
	readonly center: RadialProgressivePixelateUvCoordinate;
	readonly width: number;
	readonly height: number;
	readonly rotation: number;
	readonly start: number;
	readonly startBlockSize: number;
	readonly endBlockSize: number;
};

const radialProgressivePixelateSchema = {
	center: {
		type: 'uv-coordinate',
		min: -1,
		max: 2,
		step: 0.01,
		default: DEFAULT_CENTER,
		description: 'Center',
		visual: {
			type: 'ellipse',
			width: 'width',
			height: 'height',
			rotation: 'rotation',
			innerScale: 'start',
		},
	},
	width: {
		type: 'number',
		min: 0,
		step: 0.01,
		default: DEFAULT_WIDTH,
		description: 'Width',
		hiddenFromList: false,
	},
	height: {
		type: 'number',
		min: 0,
		step: 0.01,
		default: DEFAULT_HEIGHT,
		description: 'Height',
		hiddenFromList: false,
	},
	rotation: {
		type: 'rotation-degrees',
		step: 1,
		default: DEFAULT_ROTATION,
		description: 'Rotation',
	},
	start: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_START,
		description: 'Start',
		hiddenFromList: false,
	},
	startBlockSize: {
		type: 'number',
		min: 1,
		max: 200,
		step: 1,
		default: DEFAULT_START_BLOCK_SIZE,
		description: 'Start block size',
		hiddenFromList: false,
	},
	endBlockSize: {
		type: 'number',
		min: 1,
		max: 200,
		step: 1,
		default: DEFAULT_END_BLOCK_SIZE,
		description: 'End block size',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const resolve = (
	params: RadialProgressivePixelateParams,
): RadialProgressivePixelateResolved => ({
	center: [
		...(params.center ?? DEFAULT_CENTER),
	] as RadialProgressivePixelateUvCoordinate,
	width: params.width ?? DEFAULT_WIDTH,
	height: params.height ?? DEFAULT_HEIGHT,
	rotation: params.rotation ?? DEFAULT_ROTATION,
	start: params.start ?? DEFAULT_START,
	startBlockSize: params.startBlockSize ?? DEFAULT_START_BLOCK_SIZE,
	endBlockSize: params.endBlockSize ?? DEFAULT_END_BLOCK_SIZE,
});

const assertOptionalUvCoordinate = (value: unknown, name: string): void => {
	if (value === undefined) {
		return;
	}

	if (
		!Array.isArray(value) ||
		value.length !== 2 ||
		value.some((item) => typeof item !== 'number' || !Number.isFinite(item))
	) {
		throw new TypeError(`"${name}" must be a [number, number] tuple`);
	}
};

const validateBlockSize = (value: number, name: string): void => {
	if (value < 1) {
		throw new TypeError(`"${name}" must be >= 1`);
	}
};

const validateParams = (params: RadialProgressivePixelateParams): void => {
	assertEffectParamsObject(params, 'Radial progressive pixelate');
	assertOptionalUvCoordinate(params.center, 'center');
	assertOptionalFiniteNumber(params.width, 'width');
	assertOptionalFiniteNumber(params.height, 'height');
	assertOptionalFiniteNumber(params.rotation, 'rotation');
	validateNonNegative(params.width ?? DEFAULT_WIDTH, 'width');
	validateNonNegative(params.height ?? DEFAULT_HEIGHT, 'height');
	assertOptionalFiniteNumber(params.start, 'start');
	validateUnitInterval(params.start ?? DEFAULT_START, 'start');
	assertOptionalFiniteNumber(params.startBlockSize, 'startBlockSize');
	assertOptionalFiniteNumber(params.endBlockSize, 'endBlockSize');
	validateBlockSize(
		params.startBlockSize ?? DEFAULT_START_BLOCK_SIZE,
		'startBlockSize',
	);
	validateBlockSize(
		params.endBlockSize ?? DEFAULT_END_BLOCK_SIZE,
		'endBlockSize',
	);
};

export const radialProgressivePixelate = createEffect<
	RadialProgressivePixelateParams,
	ProgressivePixelateState
>({
	type: 'dev.remotion.effects.radialProgressivePixelate',
	label: 'radialProgressivePixelate()',
	documentationLink:
		'https://www.remotion.dev/docs/effects/radial-progressive-pixelate',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `radial-progressive-pixelate-${r.center.join(':')}-${r.width}-${r.height}-${r.rotation}-${r.start}-${r.startBlockSize}-${r.endBlockSize}`;
	},
	setup: setupProgressivePixelate,
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		prepareProgressivePixelate({
			state,
			source,
			width,
			height,
			flipSourceY,
		});
		const {gl, uniforms} = state;
		if (uniforms.uMode) gl.uniform1i(uniforms.uMode, 1);
		if (uniforms.uCenter)
			gl.uniform2f(uniforms.uCenter, r.center[0], r.center[1]);
		if (uniforms.uWidth) gl.uniform1f(uniforms.uWidth, r.width);
		if (uniforms.uHeight) gl.uniform1f(uniforms.uHeight, r.height);
		if (uniforms.uRotation) gl.uniform1f(uniforms.uRotation, r.rotation);
		if (uniforms.uRadialStart) gl.uniform1f(uniforms.uRadialStart, r.start);
		if (uniforms.uStartBlockSize)
			gl.uniform1f(uniforms.uStartBlockSize, r.startBlockSize);
		if (uniforms.uEndBlockSize)
			gl.uniform1f(uniforms.uEndBlockSize, r.endBlockSize);
		drawProgressivePixelate(state);
	},
	cleanup: cleanupProgressivePixelate,
	schema: radialProgressivePixelateSchema,
	validateParams,
});
