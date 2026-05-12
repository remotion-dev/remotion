import type {EffectDescriptor} from 'remotion';
import {Internals} from 'remotion';

const {createDescriptor, defineEffect} = Internals;

export type WaveParams = {
	readonly amplitude?: number;
	readonly wavelength?: number;
	readonly speed?: number;
	readonly sliceWidth?: number;
	readonly background?: string;
};

type WaveResolved = {
	amplitude: number;
	wavelength: number;
	speed: number;
	sliceWidth: number;
	background: string;
};

const resolve = (p: WaveParams): WaveResolved => ({
	amplitude: p.amplitude ?? 60,
	wavelength: p.wavelength ?? 240,
	speed: p.speed ?? 1 / 6,
	sliceWidth: p.sliceWidth ?? 4,
	background: p.background ?? 'transparent',
});

const waveDef = defineEffect<WaveParams, null>({
	type: 'remotion/wave',
	label: 'Wave',
	backend: '2d',
	setup: () => null,
	apply: ({source, target, frame, width, height, params}) => {
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
				Math.sin((x / r.wavelength) * Math.PI * 2 + frame * r.speed) *
				r.amplitude;
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
	schema: null,
});

// Vertical-displacement wave effect: shifts vertical slices of the source
// up/down with a sine wave that animates over time. Operates on the 2D backend.
export const wave = (params: WaveParams = {}): EffectDescriptor<unknown> =>
	createDescriptor(waveDef, params);
