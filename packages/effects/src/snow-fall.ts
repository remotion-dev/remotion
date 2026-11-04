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
import {
	setupWeatherWebGpu,
	drawWeatherWebGpu,
	cleanupWeatherWebGpu,
	type WeatherWebGpuState,
} from './weather/webgpu-runtime.js';

const {createEffect} = Internals;

export type SnowFallParams = WeatherCommonParams & {
	/** Number of flakes, an integer from `0` to `200000`. Defaults to `10000`. */
	readonly flakes?: number;
	/** Size variation, from `0` to `1`. Defaults to `0.5`. */
	readonly sizeVariation?: number;
	/** Speed variation, from `0` to `1`. Defaults to `0.5`. */
	readonly speedVariation?: number;
	/** Sideways oscillation strength, from `0` to `100`. Defaults to `2`. */
	readonly wiggleAmount?: number;
	/** Wiggle amplitude variation, from `0` to `1`. Defaults to `0.5`. */
	readonly wiggleAmountVariation?: number;
	/** Sideways oscillations per second, from `0` to `20`. Defaults to `1`. */
	readonly wiggleFrequency?: number;
	/** Wiggle frequency variation, from `0` to `1`. Defaults to `0.5`. */
	readonly wiggleFrequencyVariation?: number;
};

const DEFAULTS = {
	...COMMON_WEATHER_DEFAULTS,
	size: 3,
	speed: 100,
	wind: 25,
	windVariation: 0.5,
	color: '#ffffff',
	opacity: 1,
	transferMode: 'composite',
	flakes: 10000,
	sizeVariation: 0.5,
	speedVariation: 0.5,
	wiggleAmount: 2,
	wiggleAmountVariation: 0.5,
	wiggleFrequency: 1,
	wiggleFrequencyVariation: 0.5,
} as const satisfies Required<SnowFallParams>;

export const snowFallSchema = {
	flakes: {
		type: 'number',
		min: 0,
		max: 200000,
		step: 1,
		integer: true,
		default: DEFAULTS.flakes,
		description: 'Flakes',
		hiddenFromList: false,
	},
	sizeVariation: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULTS.sizeVariation,
		description: 'Size variation',
		hiddenFromList: false,
	},
	speedVariation: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULTS.speedVariation,
		description: 'Speed variation',
		hiddenFromList: false,
	},
	wiggleAmount: {
		type: 'number',
		min: 0,
		max: 100,
		step: 0.01,
		default: DEFAULTS.wiggleAmount,
		description: 'Wiggle amount',
		hiddenFromList: false,
	},
	wiggleAmountVariation: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULTS.wiggleAmountVariation,
		description: 'Wiggle amount variation',
		hiddenFromList: false,
	},
	wiggleFrequency: {
		type: 'number',
		min: 0,
		max: 20,
		step: 0.01,
		default: DEFAULTS.wiggleFrequency,
		description: 'Wiggle frequency',
		hiddenFromList: false,
	},
	wiggleFrequencyVariation: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULTS.wiggleFrequencyVariation,
		description: 'Wiggle frequency variation',
		hiddenFromList: false,
	},
	...createWeatherSchema(DEFAULTS, 5000, 5000),
} as const satisfies InteractivitySchema;

const resolve = (params: SnowFallParams): WeatherRenderParams => ({
	...resolveWeatherParams(params, DEFAULTS),
	count: params.flakes ?? DEFAULTS.flakes,
	sizeVariation: params.sizeVariation ?? DEFAULTS.sizeVariation,
	speedVariation: params.speedVariation ?? DEFAULTS.speedVariation,
	wiggleAmount: params.wiggleAmount ?? DEFAULTS.wiggleAmount,
	wiggleAmountVariation:
		params.wiggleAmountVariation ?? DEFAULTS.wiggleAmountVariation,
	wiggleFrequency: params.wiggleFrequency ?? DEFAULTS.wiggleFrequency,
	wiggleFrequencyVariation:
		params.wiggleFrequencyVariation ?? DEFAULTS.wiggleFrequencyVariation,
	appearance: 'soft-solid',
});

export const snowFall = createEffect<SnowFallParams>({
	type: 'remotion/snow-fall',
	label: 'snowFall()',
	documentationLink: 'https://www.remotion.dev/docs/effects/snow-fall',
	calculateKey: (params) => `snow-fall-${JSON.stringify(resolve(params))}`,
	implementations: {
		webgpu: Internals.createEffectImplementation<
			SnowFallParams,
			WeatherWebGpuState
		>({
			setup: setupWeatherWebGpu,
			apply: ({source, width, height, params, state, gpuDevice}) => {
				if (!gpuDevice)
					throw new Error(
						'A WebGPU device is required for the snow fall effect',
					);
				drawWeatherWebGpu({
					source,
					width,
					height,
					params: resolve(params),
					state,
					device: gpuDevice as GPUDevice,
					type: 'snow',
				});
			},
			cleanup: cleanupWeatherWebGpu,
		}),
		webgl2: Internals.createEffectImplementation<SnowFallParams, WeatherState>({
			setup: (target) => setupWeather(target, 'snow fall'),
			apply: ({source, width, height, params, state, flipSourceY}) => {
				drawWeather({
					state,
					source: source as TexImageSource,
					width,
					height,
					flipSourceY,
					params: resolve(params),
					type: 'snow',
				});
			},
			cleanup: cleanupWeather,
		}),
	},
	schema: snowFallSchema,
	validateParams: (params) => {
		validateWeatherParams(params, 'Snow fall', 5000, 5000);
		validateWeatherRange(params.flakes, 'flakes', 0, 200000);
		validateWeatherRange(params.sizeVariation, 'sizeVariation', 0, 1);
		validateWeatherRange(params.speedVariation, 'speedVariation', 0, 1);
		validateWeatherRange(params.wiggleAmount, 'wiggleAmount', 0, 100);
		validateWeatherRange(
			params.wiggleAmountVariation,
			'wiggleAmountVariation',
			0,
			1,
		);
		validateWeatherRange(params.wiggleFrequency, 'wiggleFrequency', 0, 20);
		validateWeatherRange(
			params.wiggleFrequencyVariation,
			'wiggleFrequencyVariation',
			0,
			1,
		);
		if (params.flakes !== undefined && !Number.isInteger(params.flakes)) {
			throw new TypeError('"flakes" must be an integer');
		}
	},
});
