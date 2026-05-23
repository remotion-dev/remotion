import type {SequenceSchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertEffectParamsObject,
	assertRequiredFiniteNumber,
} from './validate-effect-param.js';

const {createEffect} = Internals;

const DEFAULT_AMOUNT = 1 as const;

const invertSchema = {
	amount: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_AMOUNT,
		description: 'Amount',
	},
} as const satisfies SequenceSchema;

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

const assertOptionalFiniteNumber = (value: unknown, name: string): void => {
	if (value === undefined) {
		return;
	}

	assertRequiredFiniteNumber(value, name);
};

const validateInvertParams = (params: InvertParams): void => {
	assertEffectParamsObject(params, 'Invert');
	assertOptionalFiniteNumber(params.amount, 'amount');

	const {amount} = resolve(params);
	if (amount < 0) {
		throw new TypeError(
			`"amount" must be >= 0, but got ${JSON.stringify(amount)}`,
		);
	}

	if (amount > 1) {
		throw new TypeError(
			`"amount" must be <= 1, but got ${JSON.stringify(amount)}`,
		);
	}
};

export const invert = createEffect<InvertParams, null>({
	type: 'remotion/invert',
	label: 'Invert',
	backend: '2d',
	calculateKey: (params) => {
		const r = resolve(params);
		return `invert-${r.amount}`;
	},
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
	schema: invertSchema,
	validateParams: validateInvertParams,
});
