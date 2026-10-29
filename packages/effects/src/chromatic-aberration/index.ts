import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateNonNegative,
} from '../color-utils.js';
import {assertEffectParamsObject} from '../validate-effect-param.js';
import {
	applyWebGpuSinglePass,
	cleanupWebGpuSinglePass,
	setupWebGpuSinglePass,
	type WebGpuSinglePassState,
} from '../webgpu-single-pass-runtime.js';
import {
	applyChromaticAberration,
	cleanupChromaticAberration,
	setupChromaticAberration,
	type ChromaticAberrationState,
} from './chromatic-aberration-runtime.js';
import {CHROMATIC_ABERRATION_WEBGPU_SHADER} from './webgpu-shader.js';

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

export const chromaticAberration = createEffect<ChromaticAberrationParams>({
	type: 'dev.remotion.effects.chromaticAberration',
	label: 'chromaticAberration()',
	documentationLink:
		'https://www.remotion.dev/docs/effects/chromatic-aberration',
	calculateKey: (params) => {
		const resolved = resolve(params);
		return `chromatic-aberration-${resolved.amount}-${resolved.angle}`;
	},
	implementations: {
		webgpu: Internals.createEffectImplementation<
			ChromaticAberrationParams,
			WebGpuSinglePassState
		>({
			setup: (target) => setupWebGpuSinglePass(target, 'chromatic-aberration'),
			apply: ({source, width, height, params, state, gpuDevice}) => {
				if (!gpuDevice) {
					throw new Error(
						'A WebGPU device is required for the chromatic-aberration effect',
					);
				}

				const r = resolve(params);
				const radians = (r.angle * Math.PI) / 180;
				const uniformData = new Float32Array([
					(Math.cos(radians) * r.amount) / width,
					-(Math.sin(radians) * r.amount) / height,
					0,
					0,
				]);
				applyWebGpuSinglePass({
					state,
					source,
					width,
					height,
					device: gpuDevice as GPUDevice,
					shader: CHROMATIC_ABERRATION_WEBGPU_SHADER,
					uniformData,
				});
			},
			cleanup: cleanupWebGpuSinglePass,
		}),
		webgl2: Internals.createEffectImplementation<
			ChromaticAberrationParams,
			ChromaticAberrationState
		>({
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
		}),
	},
	schema: chromaticAberrationSchema,
	validateParams: validateChromaticAberrationParams,
});
