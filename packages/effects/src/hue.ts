import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {createColorMatrixImplementations} from './color-matrix-runtime.js';
import {
	assertOptionalFiniteNumber,
	DEFAULT_HUE_DEGREES,
	hueDegreesSchema,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect} = Internals;

const hueSchema = {
	degrees: hueDegreesSchema,
} as const satisfies InteractivitySchema;

export type HueParams = {
	/** Hue rotation in degrees. Defaults to `0`. */
	readonly degrees?: number;
};

type HueResolved = {
	degrees: number;
};

const resolve = (p: HueParams): HueResolved => ({
	degrees: p.degrees ?? DEFAULT_HUE_DEGREES,
});

const validateHueParams = (params: HueParams): void => {
	assertEffectParamsObject(params, 'Hue');
	assertOptionalFiniteNumber(params.degrees, 'degrees');
};

export const hue = createEffect<HueParams>({
	type: 'dev.remotion.effects.hue',
	label: 'hue()',
	documentationLink: 'https://www.remotion.dev/docs/effects/hue',
	calculateKey: (params) => {
		const r = resolve(params);
		return `hue-${r.degrees}`;
	},
	implementations: {
		...createColorMatrixImplementations<HueParams>('hue', (params) => {
			const {degrees} = resolve(params);
			const radians = ((degrees % 360) * Math.PI) / 180;
			const cosine = Math.cos(radians);
			const sine = Math.sin(radians);
			return new Float32Array([
				0.213 + 0.787 * cosine - 0.213 * sine,
				0.715 - 0.715 * cosine - 0.715 * sine,
				0.072 - 0.072 * cosine + 0.928 * sine,
				0,
				0.213 - 0.213 * cosine + 0.143 * sine,
				0.715 + 0.285 * cosine + 0.14 * sine,
				0.072 - 0.072 * cosine - 0.283 * sine,
				0,
				0.213 - 0.213 * cosine - 0.787 * sine,
				0.715 - 0.715 * cosine + 0.715 * sine,
				0.072 + 0.928 * cosine + 0.072 * sine,
				0,
				0,
				0,
				degrees % 360 === 0 ? 1 : 0,
				0,
			]);
		}),
		'2d': Internals.createEffectImplementation<HueParams, null>({
			setup: () => null,
			apply: ({source, target, width, height, params}) => {
				const ctx = target.getContext('2d');
				if (!ctx) {
					throw new Error(
						'Failed to acquire 2D context for hue effect. The canvas may have been assigned a different context type.',
					);
				}

				const r = resolve(params);

				ctx.clearRect(0, 0, width, height);
				ctx.filter = `hue-rotate(${r.degrees}deg)`;
				ctx.drawImage(source, 0, 0, width, height);
				ctx.filter = 'none';
			},
			cleanup: () => undefined,
		}),
	},
	schema: hueSchema,
	validateParams: validateHueParams,
});
