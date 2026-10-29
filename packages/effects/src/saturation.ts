import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {createColorMatrixImplementations} from './color-matrix-runtime.js';
import {
	assertOptionalFiniteNumber,
	colorMultiplierSchema,
	DEFAULT_AMOUNT,
	validateNonNegative,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect} = Internals;

const saturationSchema = {
	amount: colorMultiplierSchema,
} as const satisfies InteractivitySchema;

export type SaturationParams = {
	/** Saturation multiplier. `1` leaves colors unchanged, `0` makes them grayscale. Defaults to `1`. */
	readonly amount?: number;
};

type SaturationResolved = {
	amount: number;
};

const resolve = (p: SaturationParams): SaturationResolved => ({
	amount: p.amount ?? DEFAULT_AMOUNT,
});

const validateSaturationParams = (params: SaturationParams): void => {
	assertEffectParamsObject(params, 'Saturation');
	assertOptionalFiniteNumber(params.amount, 'amount');

	const {amount} = resolve(params);
	validateNonNegative(amount, 'amount');
};

export const saturation = createEffect<SaturationParams>({
	type: 'dev.remotion.effects.saturation',
	label: 'saturation()',
	documentationLink: 'https://www.remotion.dev/docs/effects/saturation',
	calculateKey: (params) => {
		const r = resolve(params);
		return `saturation-${r.amount}`;
	},
	implementations: {
		...createColorMatrixImplementations<SaturationParams>(
			'saturation',
			(params) => {
				const {amount} = resolve(params);
				const red = 0.213 * (1 - amount);
				const green = 0.715 * (1 - amount);
				const blue = 0.072 * (1 - amount);
				return new Float32Array([
					red + amount,
					green,
					blue,
					0,
					red,
					green + amount,
					blue,
					0,
					red,
					green,
					blue + amount,
					0,
					0,
					0,
					amount === 1 ? 1 : 0,
					0,
				]);
			},
		),
		'2d': Internals.createEffectImplementation<SaturationParams, null>({
			setup: () => null,
			apply: ({source, target, width, height, params}) => {
				const ctx = target.getContext('2d');
				if (!ctx) {
					throw new Error(
						'Failed to acquire 2D context for saturation effect. The canvas may have been assigned a different context type.',
					);
				}

				const r = resolve(params);

				ctx.clearRect(0, 0, width, height);
				ctx.filter = `saturate(${r.amount * 100}%)`;
				ctx.drawImage(source, 0, 0, width, height);
				ctx.filter = 'none';
			},
			cleanup: () => undefined,
		}),
	},
	schema: saturationSchema,
	validateParams: validateSaturationParams,
});
