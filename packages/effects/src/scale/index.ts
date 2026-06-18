import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertEffectParamsObject,
	assertRequiredFiniteNumber,
} from '../validate-effect-param.js';

const {createEffect} = Internals;

const scaleSchema = {
	scale: {
		type: 'number',
		min: 0.1,
		max: 10,
		step: 0.1,
		default: 1,
		description: 'Factor',
		hiddenFromList: false,
	},
	horizontal: {
		type: 'boolean',
		default: true,
		description: 'Horizontal',
	},
	vertical: {
		type: 'boolean',
		default: true,
		description: 'Vertical',
	},
} as const satisfies InteractivitySchema;

export type ScaleParams = {
	/** Scale factor. Defaults to `1`. Must be greater than 0. */
	readonly scale: number;
	/** Whether to apply horizontal scaling. Defaults to `true`. */
	readonly horizontal?: boolean;
	/** Whether to apply vertical scaling. Defaults to `true`. */
	readonly vertical?: boolean;
};

type ScaleResolved = {
	scale: number;
	horizontal: boolean;
	vertical: boolean;
};

const resolve = (p: ScaleParams): ScaleResolved => ({
	scale: p.scale,
	horizontal: p.horizontal ?? true,
	vertical: p.vertical ?? true,
});

const validateScaleParams = (params: ScaleParams): void => {
	assertEffectParamsObject(params, 'Scale');
	assertRequiredFiniteNumber(params.scale, 'scale');

	if (
		typeof params.horizontal !== 'undefined' &&
		typeof params.horizontal !== 'boolean'
	) {
		throw new TypeError(
			`"horizontal" must be a boolean, but got ${JSON.stringify(params.horizontal)}`,
		);
	}

	if (
		typeof params.vertical !== 'undefined' &&
		typeof params.vertical !== 'boolean'
	) {
		throw new TypeError(
			`"vertical" must be a boolean, but got ${JSON.stringify(params.vertical)}`,
		);
	}

	const resolved = resolve(params);
	if (resolved.scale <= 0) {
		throw new TypeError(
			`"scale" must be greater than 0, but got ${JSON.stringify(resolved.scale)}`,
		);
	}
};

export const scale = createEffect<ScaleParams, null>({
	type: 'dev.remotion.effects.scale',
	label: 'scale()',
	documentationLink: 'https://www.remotion.dev/docs/effects/scale',
	backend: '2d',
	calculateKey: (params) => {
		const r = resolve(params);
		return `scale-${r.scale}-${r.horizontal}-${r.vertical}`;
	},
	setup: () => null,
	apply: ({source, target, width, height, params}) => {
		const ctx = target.getContext('2d');
		if (!ctx) {
			throw new Error(
				'Failed to acquire 2D context for scale effect. The canvas may have been assigned a different context type.',
			);
		}

		const r = resolve(params);

		const scaleX = r.horizontal ? r.scale : 1;
		const scaleY = r.vertical ? r.scale : 1;

		// If scale is identity (1, 1), just copy the source
		if (scaleX === 1 && scaleY === 1) {
			ctx.clearRect(0, 0, width, height);
			ctx.drawImage(source, 0, 0, width, height);
			return;
		}

		ctx.clearRect(0, 0, width, height);

		// Save the current context state
		ctx.save();

		// Translate to center, scale, translate back
		const centerX = width / 2;
		const centerY = height / 2;

		ctx.translate(centerX, centerY);
		ctx.scale(scaleX, scaleY);
		ctx.translate(-centerX, -centerY);

		ctx.drawImage(source, 0, 0, width, height);

		// Restore the context state
		ctx.restore();
	},
	cleanup: () => undefined,
	schema: scaleSchema,
	validateParams: validateScaleParams,
});
