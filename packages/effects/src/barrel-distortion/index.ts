import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateUnitInterval,
} from '../color-utils.js';
import {assertEffectParamsObject} from '../validate-effect-param.js';
import {
	applyWebGpuSinglePass,
	cleanupWebGpuSinglePass,
	setupWebGpuSinglePass,
	type WebGpuSinglePassState,
} from '../webgpu-single-pass-runtime.js';
import {
	applyBarrelDistortion,
	cleanupBarrelDistortion,
	setupBarrelDistortion,
	type BarrelDistortionState,
} from './barrel-distortion-runtime.js';
import {BARREL_DISTORTION_WEBGPU_SHADER} from './webgpu-shader.js';

const {createEffect} = Internals;

const DEFAULT_BARREL_DISTORTION_AMOUNT = 0.25 as const;

const barrelDistortionSchema = {
	amount: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_BARREL_DISTORTION_AMOUNT,
		description: 'Amount',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type BarrelDistortionParams = {
	/** Distortion strength from `0` to `1`. Defaults to `0.25`. */
	readonly amount?: number;
};

type BarrelDistortionResolved = {
	amount: number;
};

const resolve = (p: BarrelDistortionParams): BarrelDistortionResolved => ({
	amount: p.amount ?? DEFAULT_BARREL_DISTORTION_AMOUNT,
});

const validateBarrelDistortionParams = (
	params: BarrelDistortionParams,
): void => {
	assertEffectParamsObject(params, 'Barrel distortion');
	assertOptionalFiniteNumber(params.amount, 'amount');

	const resolved = resolve(params);
	validateUnitInterval(resolved.amount, 'amount');
};

export const barrelDistortion = createEffect<BarrelDistortionParams>({
	type: 'dev.remotion.effects.barrelDistortion',
	label: 'barrelDistortion()',
	documentationLink: 'https://www.remotion.dev/docs/effects/barrel-distortion',
	calculateKey: (params) => {
		const r = resolve(params);
		return `barrel-distortion-${r.amount}`;
	},
	implementations: {
		webgpu: Internals.createEffectImplementation<
			BarrelDistortionParams,
			WebGpuSinglePassState
		>({
			setup: (target) => setupWebGpuSinglePass(target, 'barrel-distortion'),
			apply: ({source, width, height, params, state, gpuDevice}) => {
				if (!gpuDevice) {
					throw new Error(
						'A WebGPU device is required for the barrel-distortion effect',
					);
				}

				applyWebGpuSinglePass({
					state,
					source,
					width,
					height,
					device: gpuDevice as GPUDevice,
					shader: BARREL_DISTORTION_WEBGPU_SHADER,
					uniformData: new Float32Array([resolve(params).amount, 0, 0, 0]),
				});
			},
			cleanup: cleanupWebGpuSinglePass,
		}),
		webgl2: Internals.createEffectImplementation<
			BarrelDistortionParams,
			BarrelDistortionState
		>({
			setup: (target) => setupBarrelDistortion(target),
			apply: ({source, width, height, params, state, flipSourceY}) => {
				const r = resolve(params);
				applyBarrelDistortion({
					state,
					source,
					width,
					height,
					amount: r.amount,
					flipSourceY,
				});
			},
			cleanup: (state) => cleanupBarrelDistortion(state),
		}),
	},
	schema: barrelDistortionSchema,
	validateParams: validateBarrelDistortionParams,
});
