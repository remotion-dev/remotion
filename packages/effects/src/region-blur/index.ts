import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateNonNegative,
	validateUnitInterval,
} from '../color-utils.js';
import {assertEffectParamsObject} from '../validate-effect-param.js';
import {
	applyRegionBlur,
	cleanupRegionBlur,
	setupRegionBlur,
	type RegionBlurState,
} from './region-blur-runtime.js';

const {createEffect} = Internals;

const DEFAULT_BLUR_RADIUS = 40 as const;
const DEFAULT_FEATHER = 0 as const;
const DEFAULT_ROUNDNESS = 0 as const;

export type RegionBlurUvCoordinate = readonly [number, number];

export type RegionBlurParams = {
	/** Top-left corner of the region in UV coordinates. */
	readonly topLeft: RegionBlurUvCoordinate;
	/** Bottom-right corner of the region in UV coordinates. */
	readonly bottomRight: RegionBlurUvCoordinate;
	/** Gaussian blur radius in pixels. Defaults to `40`. */
	readonly blurRadius?: number;
	/** Width of the softened region edge in pixels. Defaults to `0`. */
	readonly feather?: number;
	/** Corner roundness from rectangular (`0`) to fully rounded (`1`). Defaults to `0`. */
	readonly roundness?: number;
};

type RegionBlurResolved = {
	readonly topLeft: RegionBlurUvCoordinate;
	readonly bottomRight: RegionBlurUvCoordinate;
	readonly blurRadius: number;
	readonly feather: number;
	readonly roundness: number;
};

export const regionBlurSchema = {
	topLeft: {
		type: 'uv-coordinate',
		min: -1,
		max: 2,
		step: 0.01,
		default: undefined,
		description: 'Top left',
	},
	bottomRight: {
		type: 'uv-coordinate',
		min: -1,
		max: 2,
		step: 0.01,
		default: undefined,
		description: 'Bottom right',
	},
	blurRadius: {
		type: 'number',
		min: 0,
		max: 200,
		step: 1,
		default: DEFAULT_BLUR_RADIUS,
		description: 'Blur radius',
		hiddenFromList: false,
	},
	feather: {
		type: 'number',
		min: 0,
		max: 200,
		step: 1,
		default: DEFAULT_FEATHER,
		description: 'Feather',
		hiddenFromList: false,
	},
	roundness: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_ROUNDNESS,
		description: 'Roundness',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const resolve = (params: RegionBlurParams): RegionBlurResolved => ({
	topLeft: [...params.topLeft] as RegionBlurUvCoordinate,
	bottomRight: [...params.bottomRight] as RegionBlurUvCoordinate,
	blurRadius: params.blurRadius ?? DEFAULT_BLUR_RADIUS,
	feather: params.feather ?? DEFAULT_FEATHER,
	roundness: params.roundness ?? DEFAULT_ROUNDNESS,
});

const assertRequiredUvCoordinate = (value: unknown, name: string): void => {
	if (
		!Array.isArray(value) ||
		value.length !== 2 ||
		value.some((item) => typeof item !== 'number' || !Number.isFinite(item))
	) {
		throw new TypeError(`"${name}" must be a [number, number] tuple`);
	}
};

const validateRegionBlurParams = (params: RegionBlurParams): void => {
	assertEffectParamsObject(params, 'Region blur');
	assertRequiredUvCoordinate(params.topLeft, 'topLeft');
	assertRequiredUvCoordinate(params.bottomRight, 'bottomRight');
	assertOptionalFiniteNumber(params.blurRadius, 'blurRadius');
	assertOptionalFiniteNumber(params.feather, 'feather');
	assertOptionalFiniteNumber(params.roundness, 'roundness');

	const resolved = resolve(params);
	validateNonNegative(resolved.blurRadius, 'blurRadius');
	validateNonNegative(resolved.feather, 'feather');
	validateUnitInterval(resolved.roundness, 'roundness');

	if (
		resolved.topLeft[0] >= resolved.bottomRight[0] ||
		resolved.topLeft[1] >= resolved.bottomRight[1]
	) {
		throw new TypeError(
			'"topLeft" must be above and to the left of "bottomRight"',
		);
	}
};

export const regionBlur = createEffect<RegionBlurParams, RegionBlurState>({
	type: 'remotion/region-blur',
	label: 'regionBlur()',
	documentationLink: 'https://www.remotion.dev/docs/effects/region-blur',
	backend: 'webgl2',
	calculateKey: (params) => {
		const resolved = resolve(params);
		return `region-blur-${resolved.topLeft.join(':')}-${resolved.bottomRight.join(':')}-${resolved.blurRadius}-${resolved.feather}-${resolved.roundness}`;
	},
	setup: (target) => setupRegionBlur(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const resolved = resolve(params);
		applyRegionBlur({
			state,
			source,
			width,
			height,
			flipSourceY,
			...resolved,
		});
	},
	cleanup: (state) => cleanupRegionBlur(state),
	schema: regionBlurSchema,
	validateParams: validateRegionBlurParams,
});
