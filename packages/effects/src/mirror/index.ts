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
	applyMirror,
	cleanupMirror,
	setupMirror,
	type MirrorDirection,
	type MirrorState,
} from './mirror-runtime.js';
import {MIRROR_WEBGPU_SHADER} from './webgpu-shader.js';

const {createEffect} = Internals;

const mirrorSchema = {
	direction: {
		type: 'enum',
		variants: {
			horizontal: {},
			vertical: {},
		},
		default: 'horizontal' as const,
		description: 'Direction',
	},
	position: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 0.5,
		description: 'Position',
		hiddenFromList: false,
	},
	invert: {
		type: 'boolean',
		default: false,
		description: 'Invert',
	},
} as const satisfies InteractivitySchema;

export type {MirrorDirection};

export type MirrorParams = {
	/** Mirror direction. Defaults to `horizontal`. */
	readonly direction?: MirrorDirection;
	/** Mirror position in UV coordinates. Defaults to `0.5`. */
	readonly position?: number;
	/** Mirror the other side of the image. Defaults to `false`. */
	readonly invert?: boolean;
};

type MirrorResolved = {
	direction: MirrorDirection;
	position: number;
	invert: boolean;
};

const resolve = (p: MirrorParams): MirrorResolved => ({
	direction: p.direction ?? 'horizontal',
	position: p.position ?? 0.5,
	invert: p.invert ?? false,
});

const validateMirrorParams = (params: MirrorParams): void => {
	assertEffectParamsObject(params, 'Mirror');
	assertOptionalFiniteNumber(params.position, 'position');

	if (
		params.direction !== undefined &&
		params.direction !== 'horizontal' &&
		params.direction !== 'vertical'
	) {
		throw new TypeError(
			`"direction" must be "horizontal" or "vertical", but got ${JSON.stringify(params.direction)}`,
		);
	}

	if (params.invert !== undefined && typeof params.invert !== 'boolean') {
		throw new TypeError(
			`"invert" must be a boolean, but got ${JSON.stringify(params.invert)}`,
		);
	}

	const {position} = resolve(params);
	validateUnitInterval(position, 'position');
};

export const mirror = createEffect<MirrorParams>({
	type: 'dev.remotion.effects.mirror',
	label: 'mirror()',
	documentationLink: 'https://www.remotion.dev/docs/effects/mirror',
	calculateKey: (params) => {
		const r = resolve(params);
		return `mirror-${r.direction}-${r.position}-${r.invert ? 1 : 0}`;
	},
	implementations: {
		webgpu: Internals.createEffectImplementation<
			MirrorParams,
			WebGpuSinglePassState
		>({
			setup: (target) => setupWebGpuSinglePass(target, 'mirror'),
			apply: ({source, width, height, params, state, gpuDevice}) => {
				if (!gpuDevice) {
					throw new Error('A WebGPU device is required for the mirror effect');
				}

				const r = resolve(params);
				const uniformData = new Float32Array([
					r.position,
					r.direction === 'horizontal' ? 0 : 1,
					r.invert ? 1 : 0,
					0,
				]);
				applyWebGpuSinglePass({
					state,
					source,
					width,
					height,
					device: gpuDevice as GPUDevice,
					shader: MIRROR_WEBGPU_SHADER,
					uniformData,
				});
			},
			cleanup: cleanupWebGpuSinglePass,
		}),
		webgl2: Internals.createEffectImplementation<MirrorParams, MirrorState>({
			setup: (target) => setupMirror(target),
			apply: ({source, width, height, params, state, flipSourceY}) => {
				const r = resolve(params);
				applyMirror({
					state,
					source,
					width,
					height,
					position: r.position,
					direction: r.direction,
					invert: r.invert,
					flipSourceY,
				});
			},
			cleanup: (state) => cleanupMirror(state),
		}),
	},
	schema: mirrorSchema,
	validateParams: validateMirrorParams,
});
