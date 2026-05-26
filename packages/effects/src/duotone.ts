import type {SequenceSchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	parseColorRgba,
	type ParsedColorRgba,
	validateUnitInterval,
} from './color-utils.js';
import {
	assertEffectParamsObject,
	assertOptionalColor,
} from './validate-effect-param.js';

const {createEffect} = Internals;

const DEFAULT_DARK_COLOR = '#000000' as const;
const DEFAULT_LIGHT_COLOR = '#ffffff' as const;
const DEFAULT_LUMINANCE_THRESHOLD = 0.5 as const;

export const duotoneSchema = {
	darkColor: {
		type: 'color',
		default: DEFAULT_DARK_COLOR,
		description: 'Dark color',
	},
	lightColor: {
		type: 'color',
		default: DEFAULT_LIGHT_COLOR,
		description: 'Light color',
	},
	threshold: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_LUMINANCE_THRESHOLD,
		description: 'Luminance threshold',
	},
} as const satisfies SequenceSchema;

export type DuotoneParams = {
	/** Color used for pixels below the luminance threshold. Defaults to black. */
	readonly darkColor?: string;
	/** Color used for pixels at or above the luminance threshold. Defaults to white. */
	readonly lightColor?: string;
	/** Luminance threshold from `0` to `1`. Defaults to `0.5`. */
	readonly threshold?: number;
};

type DuotoneResolved = {
	darkColor: string;
	lightColor: string;
	threshold: number;
};

type DuotoneState = {
	readonly colorCtx: CanvasRenderingContext2D;
	cachedDarkColor: string;
	cachedDarkColorRgba: ParsedColorRgba;
	cachedLightColor: string;
	cachedLightColorRgba: ParsedColorRgba;
};

const resolve = (p: DuotoneParams): DuotoneResolved => ({
	darkColor: p.darkColor ?? DEFAULT_DARK_COLOR,
	lightColor: p.lightColor ?? DEFAULT_LIGHT_COLOR,
	threshold: p.threshold ?? DEFAULT_LUMINANCE_THRESHOLD,
});

const validateDuotoneParams = (params: DuotoneParams): void => {
	assertEffectParamsObject(params, 'Duotone');
	assertOptionalColor(params.darkColor, 'darkColor');
	assertOptionalColor(params.lightColor, 'lightColor');
	assertOptionalFiniteNumber(params.threshold, 'threshold');

	const {threshold} = resolve(params);
	validateUnitInterval(threshold, 'threshold');
};

const setupDuotone = (): DuotoneState => {
	const colorCanvas = document.createElement('canvas');
	colorCanvas.width = 1;
	colorCanvas.height = 1;
	const colorCtx = colorCanvas.getContext('2d', {willReadFrequently: true});
	if (!colorCtx) {
		throw new Error('Failed to acquire 2D context for color parsing');
	}

	return {
		colorCtx,
		cachedDarkColor: '',
		cachedDarkColorRgba: [0, 0, 0, 255],
		cachedLightColor: '',
		cachedLightColorRgba: [255, 255, 255, 255],
	};
};

const getParsedColors = (
	state: DuotoneState,
	resolved: DuotoneResolved,
): {
	dark: ParsedColorRgba;
	light: ParsedColorRgba;
} => {
	if (state.cachedDarkColor !== resolved.darkColor) {
		state.cachedDarkColor = resolved.darkColor;
		state.cachedDarkColorRgba = parseColorRgba(
			state.colorCtx,
			resolved.darkColor,
		);
	}

	if (state.cachedLightColor !== resolved.lightColor) {
		state.cachedLightColor = resolved.lightColor;
		state.cachedLightColorRgba = parseColorRgba(
			state.colorCtx,
			resolved.lightColor,
		);
	}

	return {
		dark: state.cachedDarkColorRgba,
		light: state.cachedLightColorRgba,
	};
};

export const duotone = createEffect<DuotoneParams, DuotoneState>({
	type: 'remotion/duotone',
	label: 'Duotone',
	documentationLink: 'https://www.remotion.dev/docs/effects/duotone',
	backend: '2d',
	calculateKey: (params) => {
		const r = resolve(params);
		return `duotone-${r.darkColor}-${r.lightColor}-${r.threshold}`;
	},
	setup: () => setupDuotone(),
	apply: ({source, target, width, height, params, state}) => {
		const ctx = target.getContext('2d', {willReadFrequently: true});
		if (!ctx) {
			throw new Error(
				'Failed to acquire 2D context for duotone effect. The canvas may have been assigned a different context type.',
			);
		}

		const r = resolve(params);
		const {dark, light} = getParsedColors(state, r);

		ctx.clearRect(0, 0, width, height);
		ctx.drawImage(source, 0, 0, width, height);

		const imageData = ctx.getImageData(0, 0, width, height);
		const {data} = imageData;

		for (let i = 0; i < data.length; i += 4) {
			if (data[i + 3] === 0) {
				continue;
			}

			const luminance =
				(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
			const color = luminance < r.threshold ? dark : light;
			data[i] = color[0];
			data[i + 1] = color[1];
			data[i + 2] = color[2];
		}

		ctx.putImageData(imageData, 0, 0);
	},
	cleanup: () => undefined,
	schema: duotoneSchema,
	validateParams: validateDuotoneParams,
});
