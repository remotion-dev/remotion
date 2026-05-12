import type {EffectDescriptor, SequenceSchema} from 'remotion';
import {Internals} from 'remotion';

const {createDescriptor, defineEffect} = Internals;

export const tintSchema = {
	amount: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 0.5,
		description: 'Amount',
	},
} as const satisfies SequenceSchema;

export type TintParams = {
	readonly color: string;
	readonly amount?: number;
};

const tintDef = defineEffect<TintParams, null>({
	type: 'remotion/tint',
	label: 'Tint',
	backend: '2d',
	setup: () => null,
	apply: ({source, target, width, height, params}) => {
		const ctx = target.getContext('2d');
		if (!ctx) {
			throw new Error(
				'Failed to acquire 2D context for tint effect. The canvas may have been assigned a different context type.',
			);
		}

		const amount = Math.max(0, Math.min(1, params.amount ?? 0.5));

		ctx.clearRect(0, 0, width, height);
		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = 'source-over';
		ctx.drawImage(source, 0, 0, width, height);

		// `source-atop` only paints inside non-transparent regions of the source,
		// so the tint respects the source's alpha mask.
		ctx.globalAlpha = amount;
		ctx.globalCompositeOperation = 'source-atop';
		ctx.fillStyle = params.color;
		ctx.fillRect(0, 0, width, height);

		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = 'source-over';
	},
	cleanup: () => undefined,
	schema: tintSchema,
});

// Tints the source with a flat color. `amount` controls the blend strength
// (0 = no tint, 1 = full color over opaque pixels). Operates on the 2D
// backend; tinting respects the source's alpha mask.
export const tint = (params: TintParams): EffectDescriptor<unknown> =>
	createDescriptor(tintDef, params);
