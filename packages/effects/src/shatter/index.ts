import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateNonNegative,
	validateUnitInterval,
} from '../color-utils.js';
import {assertEffectParamsObject} from '../validate-effect-param.js';
import {createShatterGeometry, type ShatterGeometryParams} from './geometry.js';
import {
	cleanupShatter,
	drawShatter,
	setupShatter,
	type ShatterState,
} from './runtime.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_TIME = 0.5;
const DEFAULT_PATTERN = 'bricks';
const DEFAULT_REPETITIONS = 10;
const DEFAULT_DIRECTION = 0;
const DEFAULT_ORIGIN = [0.5, 0.5] as const;
const DEFAULT_CENTER = [0.5, 0.5] as const;
const DEFAULT_RADIUS = 0.4;
const DEFAULT_DEPTH = 0.1;
const DEFAULT_STRENGTH = 5;
const DEFAULT_ROTATION_SPEED = 0.2;
const DEFAULT_RANDOMNESS = 0.1;
const DEFAULT_VISCOSITY = 0.1;
const DEFAULT_MASS_VARIANCE = 0.3;
const DEFAULT_GRAVITY = 3;
const DEFAULT_SEED = 0;
const DEFAULT_EXTRUSION_DEPTH = 0.05;

const shatterSchema = {
	time: {
		type: 'number',
		min: 0,
		max: 5,
		step: 0.01,
		default: DEFAULT_TIME,
		description: 'Time',
		hiddenFromList: false,
	},
	pattern: {
		type: 'enum',
		variants: {bricks: {}, glass: {}, hexagons: {}, squares: {}, triangles: {}},
		default: DEFAULT_PATTERN,
		description: 'Pattern',
	},
	repetitions: {
		type: 'number',
		min: 1,
		max: 100,
		step: 1,
		default: DEFAULT_REPETITIONS,
		description: 'Repetitions',
		hiddenFromList: false,
	},
	direction: {
		type: 'rotation-degrees',
		step: 1,
		default: DEFAULT_DIRECTION,
		description: 'Pattern direction',
	},
	origin: {
		type: 'uv-coordinate',
		step: 0.01,
		default: DEFAULT_ORIGIN,
		description: 'Pattern origin',
	},
	center: {
		type: 'uv-coordinate',
		step: 0.01,
		default: DEFAULT_CENTER,
		description: 'Force center',
	},
	radius: {
		type: 'number',
		min: 0,
		max: 2,
		step: 0.01,
		default: DEFAULT_RADIUS,
		description: 'Force radius',
		hiddenFromList: false,
	},
	depth: {
		type: 'number',
		min: -1,
		max: 1,
		step: 0.01,
		default: DEFAULT_DEPTH,
		description: 'Force depth',
		hiddenFromList: false,
	},
	strength: {
		type: 'number',
		min: -20,
		max: 20,
		step: 0.1,
		default: DEFAULT_STRENGTH,
		description: 'Force strength',
		hiddenFromList: false,
	},
	rotationSpeed: {
		type: 'number',
		min: 0,
		max: 5,
		step: 0.01,
		default: DEFAULT_ROTATION_SPEED,
		description: 'Rotation speed',
		hiddenFromList: false,
	},
	randomness: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_RANDOMNESS,
		description: 'Randomness',
		hiddenFromList: false,
	},
	viscosity: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_VISCOSITY,
		description: 'Viscosity',
		hiddenFromList: false,
	},
	massVariance: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_MASS_VARIANCE,
		description: 'Mass variance',
		hiddenFromList: false,
	},
	gravity: {
		type: 'number',
		min: 0,
		max: 10,
		step: 0.1,
		default: DEFAULT_GRAVITY,
		description: 'Gravity',
		hiddenFromList: false,
	},
	seed: {
		type: 'number',
		integer: true,
		min: 0,
		max: 4294967295,
		step: 1,
		default: DEFAULT_SEED,
		description: 'Random seed',
		hiddenFromList: false,
	},
	extrusionDepth: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_EXTRUSION_DEPTH,
		description: 'Extrusion depth',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type ShatterPattern = ShatterGeometryParams['pattern'];

export type ShatterParams = {
	/** Elapsed simulation time in seconds. Must be nonnegative. Defaults to 0.5. */
	readonly time?: number;
	/** Shape of the shards. Defaults to 'bricks'. */
	readonly pattern?: ShatterPattern;
	/** Number of pattern cells across the canvas width, from 1 to 100. Defaults to 10. */
	readonly repetitions?: number;
	/** Clockwise rotation of the pattern in degrees. Defaults to 0. */
	readonly direction?: number;
	/** Pattern origin as fractions of the canvas width and height. Defaults to [0.5, 0.5]. */
	readonly origin?: readonly [number, number];
	/** Force center as fractions of the canvas width and height. Defaults to [0.5, 0.5]. */
	readonly center?: readonly [number, number];
	/** Force sphere radius as a nonnegative fraction of the canvas width. Defaults to 0.4. */
	readonly radius?: number;
	/** Force depth in front of the canvas, as a fraction of its width. Defaults to 0.1. */
	readonly depth?: number;
	/** Radial force strength. Negative values pull shards inward. Defaults to 5. */
	readonly strength?: number;
	/** Nonnegative multiplier for shard rotation in turns per second. Defaults to 0.2. */
	readonly rotationSpeed?: number;
	/** Random variation in shard velocity, from 0 to 1. Defaults to 0.1. */
	readonly randomness?: number;
	/** Drag slowing shard motion and rotation, from 0 to 1. Defaults to 0.1. */
	readonly viscosity?: number;
	/** Variation in shard mass, from 0 to 1. Defaults to 0.3. */
	readonly massVariance?: number;
	/** Nonnegative downward acceleration, in tenths of the canvas width per second squared. Defaults to 3. */
	readonly gravity?: number;
	/** Integer random seed from 0 to 4294967295. Defaults to 0. */
	readonly seed?: number;
	/** Shard thickness as a fraction of the pattern cell size, from 0 to 1. Defaults to 0.05. */
	readonly extrusionDepth?: number;
};

const resolve = (params: ShatterParams): ShatterGeometryParams => ({
	time: params.time ?? DEFAULT_TIME,
	pattern: params.pattern ?? DEFAULT_PATTERN,
	repetitions: params.repetitions ?? DEFAULT_REPETITIONS,
	direction: params.direction ?? DEFAULT_DIRECTION,
	origin: params.origin ?? DEFAULT_ORIGIN,
	center: params.center ?? DEFAULT_CENTER,
	radius: params.radius ?? DEFAULT_RADIUS,
	depth: params.depth ?? DEFAULT_DEPTH,
	strength: params.strength ?? DEFAULT_STRENGTH,
	rotationSpeed: params.rotationSpeed ?? DEFAULT_ROTATION_SPEED,
	randomness: params.randomness ?? DEFAULT_RANDOMNESS,
	viscosity: params.viscosity ?? DEFAULT_VISCOSITY,
	massVariance: params.massVariance ?? DEFAULT_MASS_VARIANCE,
	gravity: params.gravity ?? DEFAULT_GRAVITY,
	seed: params.seed ?? DEFAULT_SEED,
	extrusionDepth: params.extrusionDepth ?? DEFAULT_EXTRUSION_DEPTH,
});

type CachedShatterState = ShatterState & {
	geometryKey: string | null;
	vertices: Float32Array | null;
};

export const shatter = createEffect<ShatterParams, CachedShatterState>({
	type: 'remotion/shatter',
	label: 'shatter()',
	documentationLink: 'https://www.remotion.dev/docs/effects/shatter',
	backend: 'webgl2',
	schema: shatterSchema,
	validateParams: (params) => {
		assertEffectParamsObject(params, 'Shatter');
		for (const name of [
			'time',
			'repetitions',
			'direction',
			'radius',
			'depth',
			'strength',
			'rotationSpeed',
			'randomness',
			'viscosity',
			'massVariance',
			'gravity',
			'seed',
			'extrusionDepth',
		] as const) {
			assertOptionalFiniteNumber(params[name], name);
		}

		for (const name of ['origin', 'center'] as const) {
			const value = params[name];
			if (
				value !== undefined &&
				(!Array.isArray(value) ||
					value.length !== 2 ||
					!Number.isFinite(value[0]) ||
					!Number.isFinite(value[1]))
			) {
				throw new TypeError(`"${name}" must contain two finite numbers`);
			}
		}

		const r = resolve(params);
		if (
			params.pattern !== undefined &&
			(typeof params.pattern !== 'string' ||
				!Object.hasOwn(shatterSchema.pattern.variants, params.pattern))
		) {
			throw new TypeError(
				'"pattern" must be "bricks", "glass", "hexagons", "squares", or "triangles"',
			);
		}

		if (r.repetitions < 1 || r.repetitions > 100) {
			throw new TypeError('"repetitions" must be between 1 and 100');
		}

		for (const name of [
			'time',
			'radius',
			'rotationSpeed',
			'gravity',
		] as const) {
			validateNonNegative(r[name], name);
		}

		for (const name of [
			'randomness',
			'viscosity',
			'massVariance',
			'extrusionDepth',
		] as const) {
			validateUnitInterval(r[name], name);
		}

		if (!Number.isInteger(r.seed) || r.seed < 0 || r.seed > 4294967295) {
			throw new TypeError('"seed" must be an integer from 0 to 4294967295');
		}
	},
	calculateKey: (params) => `shatter-${JSON.stringify(resolve(params))}`,
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw createWebGL2ContextError('shatter effect');
		}

		return {...setupShatter(gl), geometryKey: null, vertices: null};
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const geometryKey = `${width}:${height}:${JSON.stringify(r)}`;
		if (state.geometryKey !== geometryKey || state.vertices === null) {
			state.vertices = createShatterGeometry(width, height, r);
			state.geometryKey = geometryKey;
		}

		drawShatter({
			state,
			source,
			width,
			height,
			flipSourceY,
			vertices: state.vertices,
		});
	},
	cleanup: cleanupShatter,
});
