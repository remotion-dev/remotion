import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
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

export const hue = createEffect<HueParams, null>({
	type: 'dev.remotion.effects.hue',
	label: 'hue()',
	documentationLink: 'https://www.remotion.dev/docs/effects/hue',
	backend: '2d',
	calculateKey: (params) => {
		const r = resolve(params);
		return `hue-${r.degrees}`;
	},
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
	schema: hueSchema,
	validateParams: validateHueParams,
});
