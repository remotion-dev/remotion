import {expect, test} from 'vitest';
import {
	applyVolume,
	VOLUME_RAMP_SECONDS,
} from '../convert-audiodata/apply-volume';

const SAMPLE_RATE = 48000;
const FRAMES = 1600;
const RAMP_FRAMES = SAMPLE_RATE * VOLUME_RAMP_SECONDS;

// A stereo frame of a constant level, so each sample shows the gain applied to it.
const constant = (level: number) => new Int16Array(FRAMES * 2).fill(level);

test('a frame at the same volume as the one before is scaled evenly', () => {
	const samples = constant(10000);
	applyVolume(samples, 0.5, 0.5, SAMPLE_RATE);
	expect(samples.every((sample) => sample === 5000)).toBe(true);
});

test('a frame at full volume after one at full volume is left alone', () => {
	const samples = constant(10000);
	applyVolume(samples, 1, 1, SAMPLE_RATE);
	expect(samples.every((sample) => sample === 10000)).toBe(true);
});

test('muting glides from the previous volume to silence without a jump', () => {
	const samples = constant(10000);
	applyVolume(samples, 0, 1, SAMPLE_RATE);

	// Starts where the previous frame left off, in both channels.
	expect(samples[0]).toBe(10000);
	expect(samples[1]).toBe(10000);
	// Silent from the end of the ramp on.
	expect(samples.slice(RAMP_FRAMES * 2).every((sample) => sample === 0)).toBe(
		true,
	);
	// No step between neighbouring samples is anywhere near a jump to 0.
	for (let frame = 1; frame < FRAMES; frame++) {
		const step = Math.abs(samples[frame * 2] - samples[(frame - 1) * 2]);
		expect(step).toBeLessThan(100);
	}
});

test('unmuting glides from silence up to the new volume', () => {
	const samples = constant(10000);
	applyVolume(samples, 1, 0, SAMPLE_RATE);

	expect(samples[0]).toBe(0);
	expect(samples[RAMP_FRAMES * 2]).toBe(10000);
	expect(samples[(FRAMES - 1) * 2]).toBe(10000);
	for (let frame = 1; frame < RAMP_FRAMES; frame++) {
		expect(samples[frame * 2]).toBeGreaterThanOrEqual(samples[(frame - 1) * 2]);
	}
});
