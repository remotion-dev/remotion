import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {createColorMatrixImplementations} from './color-matrix-runtime.js';
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

export const grayscale = createEffect<GrayscaleParams>({
	type: 'dev.remotion.effects.grayscale',
	label: 'grayscale()',
	documentationLink: 'https://www.remotion.dev/docs/effects/grayscale',
	calculateKey: (params) => {
		const r = resolve(params);
		return `grayscale-${r.amount}`;
	},
	implementations: {
		...createColorMatrixImplementations<GrayscaleParams>(
			'grayscale',
			(params) => {
				const {amount} = resolve(params);
				const red = 0.2126 * amount;
				const green = 0.7152 * amount;
				const blue = 0.0722 * amount;
				return new Float32Array([
					1 - amount + red,
					green,
					blue,
					0,
					red,
					1 - amount + green,
					blue,
					0,
					red,
					green,
					1 - amount + blue,
					0,
					0,
					0,
					amount === 0 ? 1 : 0,
					0,
				]);
			},
		),
		'2d': Internals.createEffectImplementation<GrayscaleParams, null>({
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
		}),
	},
	schema: grayscaleSchema,
	validateParams: validateGrayscaleParams,
});
