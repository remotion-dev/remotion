import type {InteractivitySchema} from 'remotion';
import {assertOptionalFiniteNumber} from '../color-utils.js';
import {
	assertEffectParamsObject,
	assertOptionalBoolean,
	assertOptionalColor,
	assertRequiredFiniteNumber,
} from '../validate-effect-param.js';

export type WeatherCommonParams = {
	/** Elapsed time in seconds. Must be nonnegative. Defaults to `0`. */
	readonly time?: number;
	/** Particle size, from `0` to `50`. Defaults to `1` for rain and `3` for snow. */
	readonly size?: number;
	/** Depth of the particle field, from `0` to `20000`. Defaults to `5000`. */
	readonly sceneDepth?: number;
	/** Fall speed. Defaults to `4000` for rain and `100` for snow. */
	readonly speed?: number;
	/** Horizontal wind strength. Positive values move right. Defaults to `0` for rain and `25` for snow. */
	readonly wind?: number;
	/** Per-particle wind variation, from `0` to `1`. Defaults to `0` for rain and `0.5` for snow. */
	readonly windVariation?: number;
	/** Random horizontal velocity spread, from `0` to `1000`. Defaults to `0`. */
	readonly spread?: number;
	/** Particle color. Its alpha multiplies opacity. Defaults to `#cccccc` for rain and `#ffffff` for snow. */
	readonly color?: string;
	/** Particle opacity, from `0` to `1`. Defaults to `0.25` for rain and `1` for snow. */
	readonly opacity?: number;
	/** Blend with the source. Defaults to `lighten` for rain and `composite` for snow. */
	readonly transferMode?: 'composite' | 'lighten';
	/** Include the source behind the particles. Defaults to `true`. */
	readonly compositeWithOriginal?: boolean;
	/** Normalized pattern position. `[0.5, 0.5]` leaves it centered, the default. */
	readonly offset?: readonly [number, number];
	/** Unsigned 32-bit integer for a repeatable particle field. Defaults to `0`. */
	readonly seed?: number;
};

export type WeatherCommonResolved = Required<WeatherCommonParams>;

export const COMMON_WEATHER_DEFAULTS = {
	time: 0,
	sceneDepth: 5000,
	spread: 0,
	compositeWithOriginal: true,
	offset: [0.5, 0.5] as const,
	seed: 0,
} as const;

export const createWeatherSchema = (
	defaults: WeatherCommonResolved,
	maxSpeed: number,
	maxWind: number,
) =>
	({
		time: {
			type: 'number',
			min: 0,
			max: 10,
			step: 0.01,
			default: defaults.time,
			description: 'Time',
			hiddenFromList: false,
		},
		size: {
			type: 'number',
			min: 0,
			max: 50,
			step: 0.01,
			default: defaults.size,
			description: 'Size',
			hiddenFromList: false,
		},
		sceneDepth: {
			type: 'number',
			min: 0,
			max: 20000,
			step: 1,
			default: defaults.sceneDepth,
			description: 'Scene depth',
			hiddenFromList: false,
		},
		speed: {
			type: 'number',
			min: 0,
			max: maxSpeed,
			step: 1,
			default: defaults.speed,
			description: 'Speed',
			hiddenFromList: false,
		},
		wind: {
			type: 'number',
			min: -maxWind,
			max: maxWind,
			step: 1,
			default: defaults.wind,
			description: 'Wind',
			hiddenFromList: false,
		},
		windVariation: {
			type: 'number',
			min: 0,
			max: 1,
			step: 0.01,
			default: defaults.windVariation,
			description: 'Wind variation',
			hiddenFromList: false,
		},
		spread: {
			type: 'number',
			min: 0,
			max: 1000,
			step: 1,
			default: defaults.spread,
			description: 'Spread',
			hiddenFromList: false,
		},
		opacity: {
			type: 'number',
			min: 0,
			max: 1,
			step: 0.01,
			default: defaults.opacity,
			description: 'Opacity',
			hiddenFromList: false,
		},
		color: {type: 'color', default: defaults.color, description: 'Color'},
		transferMode: {
			type: 'enum',
			variants: {composite: {}, lighten: {}},
			default: defaults.transferMode,
			description: 'Transfer mode',
		},
		compositeWithOriginal: {
			type: 'boolean',
			default: defaults.compositeWithOriginal,
			description: 'Composite with original',
		},
		offset: {
			type: 'uv-coordinate',
			step: 0.01,
			default: defaults.offset,
			description: 'Offset',
		},
		seed: {
			type: 'number',
			min: 0,
			max: 4294967295,
			step: 1,
			integer: true,
			default: defaults.seed,
			description: 'Seed',
			hiddenFromList: false,
		},
	}) as const satisfies InteractivitySchema;

export const resolveWeatherParams = (
	params: WeatherCommonParams,
	defaults: WeatherCommonResolved,
): WeatherCommonResolved => ({
	time: params.time ?? defaults.time,
	size: params.size ?? defaults.size,
	sceneDepth: params.sceneDepth ?? defaults.sceneDepth,
	speed: params.speed ?? defaults.speed,
	wind: params.wind ?? defaults.wind,
	windVariation: params.windVariation ?? defaults.windVariation,
	spread: params.spread ?? defaults.spread,
	color: params.color ?? defaults.color,
	opacity: params.opacity ?? defaults.opacity,
	transferMode: params.transferMode ?? defaults.transferMode,
	compositeWithOriginal:
		params.compositeWithOriginal ?? defaults.compositeWithOriginal,
	offset: params.offset ?? defaults.offset,
	seed: params.seed ?? defaults.seed,
});

export const validateWeatherRange = (
	value: number | undefined,
	name: string,
	min: number,
	max: number | null,
): void => {
	assertOptionalFiniteNumber(value, name);
	if (value === undefined) return;
	if (value < min || (max !== null && value > max)) {
		throw new TypeError(
			`"${name}" must be ${max === null ? `at least ${min}` : `between ${min} and ${max}`}, but got ${value}`,
		);
	}
};

export const validateWeatherParams = (
	params: WeatherCommonParams,
	label: string,
	maxSpeed: number,
	maxWind: number,
): void => {
	assertEffectParamsObject(params, label);
	validateWeatherRange(params.time, 'time', 0, null);
	validateWeatherRange(params.size, 'size', 0, 50);
	validateWeatherRange(params.sceneDepth, 'sceneDepth', 0, 20000);
	validateWeatherRange(params.speed, 'speed', 0, maxSpeed);
	validateWeatherRange(params.wind, 'wind', -maxWind, maxWind);
	validateWeatherRange(params.windVariation, 'windVariation', 0, 1);
	validateWeatherRange(params.spread, 'spread', 0, 1000);
	validateWeatherRange(params.opacity, 'opacity', 0, 1);
	assertOptionalColor(params.color, 'color');
	assertOptionalBoolean(params.compositeWithOriginal, 'compositeWithOriginal');
	assertOptionalFiniteNumber(params.seed, 'seed');
	if (
		params.seed !== undefined &&
		(!Number.isInteger(params.seed) ||
			params.seed < 0 ||
			params.seed > 4294967295)
	) {
		throw new TypeError('"seed" must be an unsigned 32-bit integer');
	}

	if (
		params.transferMode !== undefined &&
		params.transferMode !== 'composite' &&
		params.transferMode !== 'lighten'
	) {
		throw new TypeError('"transferMode" must be "composite" or "lighten"');
	}

	if (params.offset !== undefined) {
		if (!Array.isArray(params.offset) || params.offset.length !== 2) {
			throw new TypeError('"offset" must be a [number, number] tuple');
		}

		assertRequiredFiniteNumber(params.offset[0], 'offset[0]');
		assertRequiredFiniteNumber(params.offset[1], 'offset[1]');
	}
};
