import {describe, expect, test} from 'bun:test';
import {WsolaPitchShifter} from '../audio/wsola-pitch-shifter';

const SAMPLE_RATE = 48000;

const makeSine = (freq: number, length: number): Float32Array => {
	const out = new Float32Array(length);
	for (let i = 0; i < length; i++) {
		out[i] = Math.sin((2 * Math.PI * freq * i) / SAMPLE_RATE);
	}

	return out;
};

// Goertzel power estimate at a single frequency.
const powerAt = (signal: Float32Array, freq: number): number => {
	const w = (2 * Math.PI * freq) / SAMPLE_RATE;
	const coeff = 2 * Math.cos(w);
	let s0 = 0;
	let s1 = 0;
	let s2 = 0;
	for (let i = 0; i < signal.length; i++) {
		s0 = signal[i] + coeff * s1 - s2;
		s2 = s1;
		s1 = s0;
	}

	return s1 * s1 + s2 * s2 - coeff * s1 * s2;
};

const runOffline = (
	shifter: WsolaPitchShifter,
	input: Float32Array,
): Float32Array => {
	const parts: Float32Array[] = [];
	const chunkSize = 4096;
	for (let i = 0; i < input.length; i += chunkSize) {
		parts.push(...shifter.process([input.subarray(i, i + chunkSize)]));
	}

	parts.push(...shifter.flush());

	let total = 0;
	for (const p of parts) {
		total += p.length;
	}

	const out = new Float32Array(total);
	let offset = 0;
	for (const p of parts) {
		out.set(p, offset);
		offset += p.length;
	}

	return out;
};

describe('WsolaPitchShifter', () => {
	test('P === 1 is a bit-exact passthrough', () => {
		const shifter = new WsolaPitchShifter({
			sampleRate: SAMPLE_RATE,
			channels: 1,
		});
		const input = makeSine(440, 2048);
		const [out] = shifter.process([input]);
		expect(out.length).toBe(input.length);
		for (let i = 0; i < input.length; i++) {
			expect(out[i]).toBe(input[i]);
		}

		expect(shifter.flush()[0].length).toBe(0);
	});

	test('P === 2 shifts a 1 kHz sine up one octave, preserving length', () => {
		const shifter = new WsolaPitchShifter({
			sampleRate: SAMPLE_RATE,
			channels: 1,
		});
		shifter.setPitchRatio(2);
		const input = makeSine(1000, SAMPLE_RATE);
		const out = runOffline(shifter, input);

		// Length is preserved (WSOLA + resample keep the duration).
		expect(Math.abs(out.length - input.length)).toBeLessThan(
			input.length * 0.05,
		);

		// Analyze the steady-state middle to avoid warm-up / fade edges.
		const mid = out.subarray(
			Math.floor(out.length * 0.25),
			Math.floor(out.length * 0.75),
		);
		expect(powerAt(mid, 2000)).toBeGreaterThan(powerAt(mid, 1000) * 5);
	});

	test('P === 0.5 shifts a 1 kHz sine down one octave', () => {
		const shifter = new WsolaPitchShifter({
			sampleRate: SAMPLE_RATE,
			channels: 1,
		});
		shifter.setPitchRatio(0.5);
		const input = makeSine(1000, SAMPLE_RATE);
		const out = runOffline(shifter, input);

		const mid = out.subarray(
			Math.floor(out.length * 0.25),
			Math.floor(out.length * 0.75),
		);
		expect(powerAt(mid, 500)).toBeGreaterThan(powerAt(mid, 1000) * 5);
	});
});
