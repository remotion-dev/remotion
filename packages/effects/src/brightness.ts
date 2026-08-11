import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	brightnessAmountSchema,
	clampColorChannel,
	DEFAULT_BRIGHTNESS_AMOUNT,
	validateSignedUnitInterval,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect} = Internals;

const brightnessSchema = {
	amount: brightnessAmountSchema,
} as const satisfies InteractivitySchema;

export type BrightnessParams = {
	/** Brightness adjustment amount between -1 and 1. Defaults to `0`. */
	readonly amount?: number;
};

type BrightnessResolved = {
	amount: number;
};

const resolve = (p: BrightnessParams): BrightnessResolved => ({
	amount: p.amount ?? DEFAULT_BRIGHTNESS_AMOUNT,
});

const validateBrightnessParams = (params: BrightnessParams): void => {
	assertEffectParamsObject(params, 'Brightness');
	assertOptionalFiniteNumber(params.amount, 'amount');

	const {amount} = resolve(params);
	validateSignedUnitInterval(amount, 'amount');
};

export const brightness = createEffect<BrightnessParams, null>({
	type: 'dev.remotion.effects.brightness',
	label: 'brightness()',
	documentationLink: 'https://www.remotion.dev/docs/effects/brightness',
	backend: '2d',
	calculateKey: (params) => {
		const r = resolve(params);
		return `brightness-${r.amount}`;
	},
	setup: () => null,
	apply: ({source, target, width, height, params}) => {
		const ctx = target.getContext('2d');
		if (!ctx) {
			throw new Error(
				'Failed to acquire 2D context for brightness effect. The canvas may have been assigned a different context type.',
			);
		}

		const r = resolve(params);

		ctx.clearRect(0, 0, width, height);
		ctx.drawImage(source, 0, 0, width, height);

		if (r.amount === 0) {
			return;
		}

		const imageData = ctx.getImageData(0, 0, width, height);
		const delta = Math.round(r.amount * 255);
		const {data} = imageData;

		for (let i = 0; i < data.length; i += 4) {
			data[i] = clampColorChannel(data[i] + delta);
			data[i + 1] = clampColorChannel(data[i + 1] + delta);
			data[i + 2] = clampColorChannel(data[i + 2] + delta);
		}

		ctx.putImageData(imageData, 0, 0);
	},
	cleanup: () => undefined,
	schema: brightnessSchema,
	validateParams: validateBrightnessParams,
});
