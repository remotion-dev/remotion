import type {SequenceSchema} from 'remotion';
import {Internals} from 'remotion';

const {createEffect} = Internals;

export const waveSchema = {
	amplitude: {
		type: 'number',
		min: 0,
		max: 500,
		step: 1,
		default: 60,
		description: 'Amplitude',
	},
	wavelength: {
		type: 'number',
		min: 1,
		max: 2000,
		step: 1,
		default: 240,
		description: 'Wavelength',
	},
	evolution: {
		type: 'number',
		default: 0,
		description: 'Evolution',
	},
	sliceWidth: {
		type: 'number',
		min: 1,
		max: 100,
		step: 1,
		default: 4,
		description: 'Slice width',
	},
	background: {
		type: 'color',
		default: 'transparent',
		description: 'Background',
	},
} as const satisfies SequenceSchema;

export type WaveParams = {
	readonly amplitude?: number;
	readonly wavelength?: number;
	readonly evolution?: number;
	readonly sliceWidth?: number;
	readonly background?: string;
};

type WaveResolved = {
	amplitude: number;
	wavelength: number;
	evolution: number;
	sliceWidth: number;
	background: string;
};

const resolve = (p: WaveParams): WaveResolved => ({
	amplitude: p.amplitude ?? 60,
	wavelength: p.wavelength ?? 240,
	evolution: p.evolution ?? 0,
	sliceWidth: p.sliceWidth ?? 4,
	background: p.background ?? 'transparent',
});

// Vertical-displacement wave effect: shifts vertical slices of the source
// up/down with a sine wave phase driven by `evolution`. Operates on the 2D
// backend.
export const wave = createEffect<WaveParams, null>({
	type: 'remotion/wave',
	label: 'Wave',
	backend: '2d',
	calculateKey: (params) => {
		const r = resolve(params);
		return `wave-${r.amplitude}-${r.wavelength}-${r.evolution}-${r.sliceWidth}-${r.background}`;
	},
	setup: () => null,
	apply: ({source, target, width, height, params}) => {
		const ctx = target.getContext('2d');
		if (!ctx) {
			throw new Error(
				'Failed to acquire 2D context for wave effect. The canvas may have been assigned a different context type.',
			);
		}

		const r = resolve(params);

		ctx.clearRect(0, 0, width, height);
		if (r.background !== 'transparent') {
			ctx.fillStyle = r.background;
			ctx.fillRect(0, 0, width, height);
		}

		for (let x = 0; x < width; x += r.sliceWidth) {
			const offset =
				Math.sin((x / r.wavelength) * Math.PI * 2 + r.evolution) * r.amplitude;
			ctx.drawImage(
				source,
				x,
				0,
				r.sliceWidth,
				height,
				x,
				offset,
				r.sliceWidth,
				height,
			);
		}
	},
	cleanup: () => undefined,
	schema: waveSchema,
	validateParams: () => {},
});
