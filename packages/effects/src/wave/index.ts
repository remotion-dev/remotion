import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertEffectParamsObject,
	assertRequiredFiniteNumber,
} from '../validate-effect-param.js';
import {
	applyWave,
	cleanupWave,
	setupWave,
	type WaveState,
} from './wave-runtime.js';

const {createEffect} = Internals;

export type WaveDirection = 'horizontal' | 'vertical';

const waveSchema = {
	phase: {
		type: 'number',
		default: 0,
		description: 'Phase',
		hiddenFromList: false,
	},
	direction: {
		type: 'enum',
		variants: {
			horizontal: {},
			vertical: {},
		},
		default: 'horizontal' as const,
		description: 'Direction',
	},
	amplitude: {
		type: 'number',
		min: 0,
		max: 500,
		step: 1,
		default: 60,
		description: 'Amplitude',
		hiddenFromList: false,
	},
	wavelength: {
		type: 'number',
		min: 1,
		max: 2000,
		step: 1,
		default: 240,
		description: 'Wavelength',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type WaveParams = {
	/** Phase offset in radians. */
	readonly phase?: number;
	/** Wave propagation axis. Defaults to `horizontal`. */
	readonly direction?: WaveDirection;
	readonly amplitude?: number;
	readonly wavelength?: number;
};

type WaveResolved = {
	phase: number;
	direction: WaveDirection;
	amplitude: number;
	wavelength: number;
};

const resolve = (p: WaveParams): WaveResolved => ({
	phase: p.phase ?? 0,
	direction: p.direction ?? 'horizontal',
	amplitude: p.amplitude ?? 60,
	wavelength: p.wavelength ?? 240,
});

const assertOptionalFiniteNumber = (value: unknown, name: string): void => {
	if (value === undefined) {
		return;
	}

	assertRequiredFiniteNumber(value, name);
};

const validateWaveParams = (params: WaveParams): void => {
	assertEffectParamsObject(params, 'Wave');
	assertOptionalFiniteNumber(params.phase, 'phase');
	assertOptionalFiniteNumber(params.amplitude, 'amplitude');
	assertOptionalFiniteNumber(params.wavelength, 'wavelength');

	if (
		params.direction !== undefined &&
		params.direction !== 'horizontal' &&
		params.direction !== 'vertical'
	) {
		throw new TypeError(
			`"direction" must be "horizontal" or "vertical", but got ${JSON.stringify(params.direction)}`,
		);
	}

	const resolved = resolve(params);
	if (resolved.amplitude < 0) {
		throw new TypeError(
			`"amplitude" must be >= 0, but got ${JSON.stringify(resolved.amplitude)}`,
		);
	}

	if (resolved.wavelength <= 0) {
		throw new TypeError(
			`"wavelength" must be > 0, but got ${JSON.stringify(resolved.wavelength)}`,
		);
	}
};

// Sine wave warp: displaces source UVs along the propagation axis. WebGL2 only.
export const wave = createEffect<WaveParams, WaveState>({
	type: 'dev.remotion.effects.wave',
	label: 'wave()',
	documentationLink: 'https://www.remotion.dev/docs/effects/wave',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `wave-${r.phase}-${r.direction}-${r.amplitude}-${r.wavelength}`;
	},
	setup: (target) => setupWave(target),
	apply: ({source, width, height, params, state}) => {
		const r = resolve(params);
		applyWave({
			state,
			source,
			width,
			height,
			amplitude: r.amplitude,
			wavelength: r.wavelength,
			phase: r.phase,
			direction: r.direction,
		});
	},
	cleanup: (state) => cleanupWave(state),
	schema: waveSchema,
	validateParams: validateWaveParams,
});
