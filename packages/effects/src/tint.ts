import type {SequenceSchema} from 'remotion';
import {Internals} from 'remotion';

const {createEffect} = Internals;

const DEFAULT_AMOUNT = 0.5 as const;

export const tintSchema = {
	amount: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_AMOUNT,
		description: 'Amount',
	},
} as const satisfies SequenceSchema;

export type TintParams = {
	readonly color: string;
	readonly amount?: number;
};

type TintResolved = {
	color: string;
	amount: number;
};

const resolve = (p: TintParams): TintResolved => ({
	color: p.color,
	amount: p.amount ?? DEFAULT_AMOUNT,
});

// Tints the source with a flat color. `amount` controls the blend strength
// (0 = no tint, 1 = full color over opaque pixels). Operates on the 2D
// backend; tinting respects the source's alpha mask.
export const tint = createEffect<TintParams, null>({
	type: 'remotion/tint',
	factoryName: 'tint',
	label: 'Tint',
	backend: '2d',
	calculateKey: (params) => {
		const r = resolve(params);
		return `tint-${r.color}-${r.amount}`;
	},
	setup: () => null,
	apply: ({source, target, width, height, params}) => {
		const ctx = target.getContext('2d');
		if (!ctx) {
			throw new Error(
				'Failed to acquire 2D context for tint effect. The canvas may have been assigned a different context type.',
			);
		}

		const r = resolve(params);
		const amount = Math.max(0, Math.min(1, r.amount));

		ctx.clearRect(0, 0, width, height);
		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = 'source-over';
		ctx.drawImage(source, 0, 0, width, height);

		// `source-atop` only paints inside non-transparent regions of the source,
		// so the tint respects the source's alpha mask.
		ctx.globalAlpha = amount;
		ctx.globalCompositeOperation = 'source-atop';
		ctx.fillStyle = r.color;
		ctx.fillRect(0, 0, width, height);

		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = 'source-over';
	},
	cleanup: () => undefined,
	schema: tintSchema,
});
