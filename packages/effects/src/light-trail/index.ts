import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	parseColorRgba,
	validateNonNegative,
	validateUnitInterval,
} from '../color-utils.js';
import {
	assertEffectParamsObject,
	assertOptionalColor,
} from '../validate-effect-param.js';
import {
	applyLightTrail,
	cleanupLightTrail,
	setupLightTrail,
	type LightTrailState,
} from './light-trail-runtime.js';

const {createEffect} = Internals;

const DEFAULT_DIRECTION = 180 as const;
const DEFAULT_DISTANCE = 80 as const;
const DEFAULT_INTENSITY = 1 as const;
const DEFAULT_DECAY = 0.9 as const;
const DEFAULT_THRESHOLD = 0 as const;
const DEFAULT_SAMPLES = 32 as const;
const DEFAULT_COLOR = '#ffffff' as const;
const MAX_SAMPLES = 64 as const;

const lightTrailSchema = {
	direction: {
		type: 'rotation-degrees',
		step: 1,
		default: DEFAULT_DIRECTION,
		description: 'Direction',
	},
	distance: {
		type: 'number',
		min: 0,
		max: 300,
		step: 1,
		default: DEFAULT_DISTANCE,
		description: 'Distance',
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
	decay: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_DECAY,
		description: 'Decay',
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
	samples: {
		type: 'number',
		min: 1,
		max: MAX_SAMPLES,
		step: 1,
		default: DEFAULT_SAMPLES,
		description: 'Samples',
		hiddenFromList: false,
	},
	color: {
		type: 'color',
		default: DEFAULT_COLOR,
		description: 'Color',
	},
} as const satisfies InteractivitySchema;

export type LightTrailParams = {
	/** Direction in which the trail extends, in degrees. Defaults to `180`. */
	readonly direction?: number;
	/** Length of the trail in pixels. Defaults to `80`. */
	readonly distance?: number;
	/** Brightness multiplier for the trail. Defaults to `1`. */
	readonly intensity?: number;
	/** Falloff from one sample to the next. Defaults to `0.9`. */
	readonly decay?: number;
	/** Luminance or alpha threshold from `0` to `1`. Defaults to `0`. */
	readonly threshold?: number;
	/** Number of samples used for the trail. Defaults to `32`. */
	readonly samples?: number;
	/** Color of the trail. Defaults to white. */
	readonly color?: string;
};

type LightTrailResolved = {
	readonly direction: number;
	readonly distance: number;
	readonly intensity: number;
	readonly decay: number;
	readonly threshold: number;
	readonly samples: number;
	readonly color: string;
};

const resolve = (p: LightTrailParams): LightTrailResolved => ({
	direction: p.direction ?? DEFAULT_DIRECTION,
	distance: p.distance ?? DEFAULT_DISTANCE,
	intensity: p.intensity ?? DEFAULT_INTENSITY,
	decay: p.decay ?? DEFAULT_DECAY,
	threshold: p.threshold ?? DEFAULT_THRESHOLD,
	samples: p.samples ?? DEFAULT_SAMPLES,
	color: p.color ?? DEFAULT_COLOR,
});

const validateSamples = (samples: number): void => {
	if (!Number.isInteger(samples)) {
		throw new TypeError(`"samples" must be an integer, but got ${samples}`);
	}

	if (samples < 1) {
		throw new TypeError(`"samples" must be >= 1, but got ${samples}`);
	}

	if (samples > MAX_SAMPLES) {
		throw new TypeError(
			`"samples" must be <= ${MAX_SAMPLES}, but got ${samples}`,
		);
	}
};

const validateLightTrailParams = (params: LightTrailParams): void => {
	assertEffectParamsObject(params, 'Light trail');
	assertOptionalFiniteNumber(params.direction, 'direction');
	assertOptionalFiniteNumber(params.distance, 'distance');
	assertOptionalFiniteNumber(params.intensity, 'intensity');
	assertOptionalFiniteNumber(params.decay, 'decay');
	assertOptionalFiniteNumber(params.threshold, 'threshold');
	assertOptionalFiniteNumber(params.samples, 'samples');
	assertOptionalColor(params.color, 'color');

	const r = resolve(params);
	validateNonNegative(r.distance, 'distance');
	validateNonNegative(r.intensity, 'intensity');
	validateUnitInterval(r.decay, 'decay');
	validateUnitInterval(r.threshold, 'threshold');
	validateSamples(r.samples);
};

export const lightTrail = createEffect<LightTrailParams, LightTrailState>({
	type: 'remotion/light-trail',
	label: 'lightTrail()',
	documentationLink: 'https://www.remotion.dev/docs/effects/light-trail',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `light-trail-${r.direction}-${r.distance}-${r.intensity}-${r.decay}-${r.threshold}-${r.samples}-${r.color}`;
	},
	setup: (target) => setupLightTrail(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);

		if (state.cachedColorStr !== r.color) {
			state.cachedColorStr = r.color;
			state.cachedColorRgba = parseColorRgba(state.colorCtx, r.color);
		}

		applyLightTrail({
			state,
			source,
			width,
			height,
			direction: r.direction,
			distance: r.distance,
			intensity: r.intensity,
			decay: r.decay,
			threshold: r.threshold,
			samples: r.samples,
			color: state.cachedColorRgba,
			flipSourceY,
		});
	},
	cleanup: (state) => cleanupLightTrail(state),
	schema: lightTrailSchema,
	validateParams: validateLightTrailParams,
});
