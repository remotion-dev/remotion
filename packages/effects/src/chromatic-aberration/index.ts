import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateNonNegative,
} from '../color-utils.js';
import {assertEffectParamsObject} from '../validate-effect-param.js';
import {
	applyChromaticAberration,
	cleanupChromaticAberration,
	setupChromaticAberration,
	type ChromaticAberrationState,
} from './chromatic-aberration-runtime.js';

const {createEffect} = Internals;

const DEFAULT_CHROMATIC_ABERRATION_AMOUNT = 8 as const;
const DEFAULT_CHROMATIC_ABERRATION_ANGLE = 0 as const;

const chromaticAberrationSchema = {
	amount: {
		type: 'number',
		min: 0,
		max: 100,
		step: 1,
		default: DEFAULT_CHROMATIC_ABERRATION_AMOUNT,
		description: 'Amount',
		hiddenFromList: false,
	},
	angle: {
		type: 'rotation-degrees',
		step: 1,
		default: DEFAULT_CHROMATIC_ABERRATION_ANGLE,
		description: 'Angle',
	},
} as const satisfies InteractivitySchema;

export type ChromaticAberrationParams = {
	/** RGB channel separation in pixels. Defaults to `8`. */
	readonly amount?: number;
	/** Direction of the split in degrees. Defaults to `0`. */
	readonly angle?: number;
};

type ChromaticAberrationResolved = {
	readonly amount: number;
	readonly angle: number;
};

const resolve = (
	params: ChromaticAberrationParams,
): ChromaticAberrationResolved => ({
	amount: params.amount ?? DEFAULT_CHROMATIC_ABERRATION_AMOUNT,
	angle: params.angle ?? DEFAULT_CHROMATIC_ABERRATION_ANGLE,
});

const validateChromaticAberrationParams = (
	params: ChromaticAberrationParams,
): void => {
	assertEffectParamsObject(params, 'Chromatic Aberration');
	assertOptionalFiniteNumber(params.amount, 'amount');
	assertOptionalFiniteNumber(params.angle, 'angle');

	const resolved = resolve(params);
	validateNonNegative(resolved.amount, 'amount');
};

export const chromaticAberration = createEffect<
	ChromaticAberrationParams,
	ChromaticAberrationState
>({
	type: 'dev.remotion.effects.chromaticAberration',
	label: 'chromaticAberration()',
	documentationLink:
		'https://www.remotion.dev/docs/effects/chromatic-aberration',
	backend: 'webgl2',
	calculateKey: (params) => {
		const resolved = resolve(params);
		return `chromatic-aberration-${resolved.amount}-${resolved.angle}`;
	},
	setup: (target) => setupChromaticAberration(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const resolved = resolve(params);
		applyChromaticAberration({
			state,
			source,
			width,
			height,
			amount: resolved.amount,
			angle: resolved.angle,
			flipSourceY,
		});
	},
	cleanup: (state) => cleanupChromaticAberration(state),
	schema: chromaticAberrationSchema,
	validateParams: validateChromaticAberrationParams,
});
