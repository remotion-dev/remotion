import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {createColorMatrixImplementations} from './color-matrix-runtime.js';
import {
	assertOptionalFiniteNumber,
	clampColorChannel,
	colorMultiplierSchema,
	DEFAULT_AMOUNT,
	validateNonNegative,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect} = Internals;

const contrastSchema = {
	amount: colorMultiplierSchema,
} as const satisfies InteractivitySchema;

export type ContrastParams = {
	/** Contrast multiplier. `1` leaves the image unchanged, `0` produces a flat gray, values above `1` increase contrast. Defaults to `1`. */
	readonly amount?: number;
};

type ContrastResolved = {
	amount: number;
};

const resolve = (p: ContrastParams): ContrastResolved => ({
	amount: p.amount ?? DEFAULT_AMOUNT,
});

const validateContrastParams = (params: ContrastParams): void => {
	assertEffectParamsObject(params, 'Contrast');
	assertOptionalFiniteNumber(params.amount, 'amount');

	const {amount} = resolve(params);
	validateNonNegative(amount, 'amount');
};

export const contrast = createEffect<ContrastParams>({
	type: 'dev.remotion.effects.contrast',
	label: 'contrast()',
	documentationLink: 'https://www.remotion.dev/docs/effects/contrast',
	calculateKey: (params) => {
		const r = resolve(params);
		return `contrast-${r.amount}`;
	},
	implementations: {
		...createColorMatrixImplementations<ContrastParams>(
			'contrast',
			(params) => {
				const {amount} = resolve(params);
				// Beyond this value every byte other than 128 already clips.
				const factor = Math.min(amount, 256);
				return new Float32Array([
					factor,
					0,
					0,
					0,
					0,
					factor,
					0,
					0,
					0,
					0,
					factor,
					0,
					2,
					0,
					amount === 1 ? 1 : 0,
					0,
				]);
			},
		),
		'2d': Internals.createEffectImplementation<ContrastParams, null>({
			setup: () => null,
			apply: ({source, target, width, height, params}) => {
				const ctx = target.getContext('2d');
				if (!ctx) {
					throw new Error(
						'Failed to acquire 2D context for contrast effect. The canvas may have been assigned a different context type.',
					);
				}

				const r = resolve(params);

				ctx.clearRect(0, 0, width, height);
				ctx.drawImage(source, 0, 0, width, height);

				if (r.amount === 1) {
					return;
				}

				const imageData = ctx.getImageData(0, 0, width, height);
				const {data} = imageData;
				const factor = r.amount;

				for (let i = 0; i < data.length; i += 4) {
					data[i] = clampColorChannel((data[i] - 128) * factor + 128);
					data[i + 1] = clampColorChannel((data[i + 1] - 128) * factor + 128);
					data[i + 2] = clampColorChannel((data[i + 2] - 128) * factor + 128);
				}

				ctx.putImageData(imageData, 0, 0);
			},
			cleanup: () => undefined,
		}),
	},
	schema: contrastSchema,
	validateParams: validateContrastParams,
});
