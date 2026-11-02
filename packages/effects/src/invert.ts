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

const invertSchema = {
	amount: colorAmountSchema,
} as const satisfies InteractivitySchema;

export type InvertParams = {
	/** Mix between original color and inverted color. Defaults to `1`. */
	readonly amount?: number;
};

type InvertResolved = {
	amount: number;
};

const resolve = (p: InvertParams): InvertResolved => ({
	amount: p.amount ?? DEFAULT_AMOUNT,
});

const validateInvertParams = (params: InvertParams): void => {
	assertEffectParamsObject(params, 'Invert');
	assertOptionalFiniteNumber(params.amount, 'amount');

	const {amount} = resolve(params);
	validateUnitInterval(amount, 'amount');
};

export const invert = createEffect<InvertParams>({
	type: 'dev.remotion.effects.invert',
	label: 'invert()',
	documentationLink: 'https://www.remotion.dev/docs/effects/invert',
	calculateKey: (params) => {
		const r = resolve(params);
		return `invert-${r.amount}`;
	},
	implementations: {
		...createColorMatrixImplementations<InvertParams>('invert', (params) => {
			const {amount} = resolve(params);
			const factor = 1 - 2 * amount;
			return new Float32Array([
				factor,
				0,
				0,
				amount,
				0,
				factor,
				0,
				amount,
				0,
				0,
				factor,
				amount,
				0,
				0,
				amount === 0 ? 1 : 0,
				0,
			]);
		}),
		'2d': Internals.createEffectImplementation<InvertParams, null>({
			setup: () => null,
			apply: ({source, target, width, height, params}) => {
				const ctx = target.getContext('2d');
				if (!ctx) {
					throw new Error(
						'Failed to acquire 2D context for invert effect. The canvas may have been assigned a different context type.',
					);
				}

				const r = resolve(params);

				ctx.clearRect(0, 0, width, height);
				ctx.filter = `invert(${r.amount * 100}%)`;
				ctx.drawImage(source, 0, 0, width, height);
				ctx.filter = 'none';
			},
			cleanup: () => undefined,
		}),
	},
	schema: invertSchema,
	validateParams: validateInvertParams,
});
