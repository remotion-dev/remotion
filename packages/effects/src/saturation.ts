import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
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

export const saturation = createEffect<SaturationParams, null>({
	type: 'dev.remotion.effects.saturation',
	label: 'saturation()',
	documentationLink: 'https://www.remotion.dev/docs/effects/saturation',
	backend: '2d',
	calculateKey: (params) => {
		const r = resolve(params);
		return `saturation-${r.amount}`;
	},
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
	schema: saturationSchema,
	validateParams: validateSaturationParams,
});
