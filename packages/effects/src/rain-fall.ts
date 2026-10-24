import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	COMMON_WEATHER_DEFAULTS,
	createWeatherSchema,
	resolveWeatherParams,
	validateWeatherParams,
	validateWeatherRange,
	type WeatherCommonParams,
} from './weather/params.js';
import {
	cleanupWeather,
	drawWeather,
	setupWeather,
	type WeatherRenderParams,
	type WeatherState,
} from './weather/runtime.js';

const {createEffect} = Internals;

export type RainFallParams = WeatherCommonParams & {
	/** Number of drops, an integer from `0` to `100000`. Defaults to `5000`. */
	readonly drops?: number;
	/** Refract the source color into each drop, or use a solid color. Defaults to `refracting`. */
	readonly appearance?: 'refracting' | 'soft-solid';
};

const DEFAULTS = {
	...COMMON_WEATHER_DEFAULTS,
	size: 1,
	speed: 4000,
	wind: 0,
	windVariation: 0,
	color: '#cccccc',
	opacity: 0.25,
	transferMode: 'lighten',
	drops: 5000,
	appearance: 'refracting',
} as const satisfies Required<RainFallParams>;

export const rainFallSchema = {
	drops: {
		type: 'number',
		min: 0,
		max: 100000,
		step: 1,
		integer: true,
		default: DEFAULTS.drops,
		description: 'Drops',
		hiddenFromList: false,
	},
	...createWeatherSchema(DEFAULTS, 20000, 10000),
	appearance: {
		type: 'enum',
		variants: {refracting: {}, 'soft-solid': {}},
		default: DEFAULTS.appearance,
		description: 'Appearance',
	},
} as const satisfies InteractivitySchema;

const resolve = (params: RainFallParams): WeatherRenderParams => ({
	...resolveWeatherParams(params, DEFAULTS),
	count: params.drops ?? DEFAULTS.drops,
	sizeVariation: 0,
	speedVariation: 0,
	wiggleAmount: 0,
	wiggleAmountVariation: 0,
	wiggleFrequency: 0,
	wiggleFrequencyVariation: 0,
	appearance: params.appearance ?? DEFAULTS.appearance,
});

export const rainFall = createEffect<RainFallParams, WeatherState>({
	type: 'remotion/rain-fall',
	label: 'rainFall()',
	documentationLink: 'https://www.remotion.dev/docs/effects/rain-fall',
	backend: 'webgl2',
	calculateKey: (params) => `rain-fall-${JSON.stringify(resolve(params))}`,
	setup: (target) => setupWeather(target, 'rain fall'),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		drawWeather({
			state,
			source: source as TexImageSource,
			width,
			height,
			flipSourceY,
			params: resolve(params),
			type: 'rain',
		});
	},
	cleanup: cleanupWeather,
	schema: rainFallSchema,
	validateParams: (params) => {
		validateWeatherParams(params, 'Rain fall', 20000, 10000);
		validateWeatherRange(params.drops, 'drops', 0, 100000);
		if (params.drops !== undefined && !Number.isInteger(params.drops)) {
			throw new TypeError('"drops" must be an integer');
		}

		if (
			params.appearance !== undefined &&
			params.appearance !== 'refracting' &&
			params.appearance !== 'soft-solid'
		) {
			throw new TypeError('"appearance" must be "refracting" or "soft-solid"');
		}
	},
});
