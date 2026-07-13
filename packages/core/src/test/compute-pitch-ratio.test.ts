import {describe, expect, test} from 'bun:test';
import {computePitchRatio} from '../audio/compute-pitch-ratio';

describe('computePitchRatio', () => {
	test('preservePitch divides toneFrequency by the combined rate', () => {
		expect(
			computePitchRatio({
				preservePitch: true,
				toneFrequency: 1,
				combinedPlaybackRate: 2,
			}),
		).toBe(0.5);
	});

	test('preservePitch with tone and rate', () => {
		expect(
			computePitchRatio({
				preservePitch: true,
				toneFrequency: 1.5,
				combinedPlaybackRate: 3,
			}),
		).toBe(0.5);
	});

	test('not preserving pitch returns the tone frequency', () => {
		expect(
			computePitchRatio({
				preservePitch: false,
				toneFrequency: 1.5,
				combinedPlaybackRate: 2,
			}),
		).toBe(1.5);
	});

	test('not preserving pitch ignores the rate', () => {
		expect(
			computePitchRatio({
				preservePitch: false,
				toneFrequency: 1,
				combinedPlaybackRate: 4,
			}),
		).toBe(1);
	});

	describe('P === 1 no-op cases', () => {
		test('preservePitch, rate 1, tone 1', () => {
			expect(
				computePitchRatio({
					preservePitch: true,
					toneFrequency: 1,
					combinedPlaybackRate: 1,
				}),
			).toBe(1);
		});

		test('preservePitch, tone equals rate', () => {
			expect(
				computePitchRatio({
					preservePitch: true,
					toneFrequency: 2,
					combinedPlaybackRate: 2,
				}),
			).toBe(1);
		});

		test('not preservePitch, tone 1', () => {
			expect(
				computePitchRatio({
					preservePitch: false,
					toneFrequency: 1,
					combinedPlaybackRate: 2,
				}),
			).toBe(1);
		});
	});
});
