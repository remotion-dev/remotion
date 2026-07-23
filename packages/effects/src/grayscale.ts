import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	colorAmountSchema,
	DEFAULT_AMOUNT,
	validateUnitInterval,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect} = Internals;

const grayscaleSchema = {
	amount: colorAmountSchema,
} as const satisfies InteractivitySchema;

export type GrayscaleParams = {
	/** Mix between original color and grayscale. Defaults to `1`. */
	readonly amount?: number;
};

type GrayscaleResolved = {
	amount: number;
};

const resolve = (p: GrayscaleParams): GrayscaleResolved => ({
	amount: p.amount ?? DEFAULT_AMOUNT,
});

const validateGrayscaleParams = (params: GrayscaleParams): void => {
	assertEffectParamsObject(params, 'Grayscale');
	assertOptionalFiniteNumber(params.amount, 'amount');

	const {amount} = resolve(params);
	validateUnitInterval(amount, 'amount');
};

export const grayscale = createEffect<GrayscaleParams, null>({
	type: 'dev.remotion.effects.grayscale',
	label: 'grayscale()',
	documentationLink: 'https://www.remotion.dev/docs/effects/grayscale',
	backend: '2d',
	calculateKey: (params) => {
		const r = resolve(params);
		return `grayscale-${r.amount}`;
	},
	setup: () => null,
	apply: ({source, target, width, height, params}) => {
		const ctx = target.getContext('2d');
		if (!ctx) {
			throw new Error(
				'Failed to acquire 2D context for grayscale effect. The canvas may have been assigned a different context type.',
			);
		}

		const r = resolve(params);

		ctx.clearRect(0, 0, width, height);
		ctx.filter = `grayscale(${r.amount * 100}%)`;
		ctx.drawImage(source, 0, 0, width, height);
		ctx.filter = 'none';
	},
	cleanup: () => undefined,
	schema: grayscaleSchema,
	validateParams: validateGrayscaleParams,
});
