import {describe, expect, test} from 'bun:test';
import {validateSelectedFrames} from '../validate-selected-frames';

describe('validateSelectedFrames()', () => {
	test('sorts a valid selection', () => {
		expect(
			validateSelectedFrames({
				frames: [8, 2, 5],
				durationInFrames: 10,
			}),
		).toEqual([2, 5, 8]);
	});

	test('rejects invalid selections', () => {
		expect(() =>
			validateSelectedFrames({frames: [], durationInFrames: 10}),
		).toThrow(/at least one frame/);
		expect(() =>
			validateSelectedFrames({frames: [2, 2], durationInFrames: 10}),
		).toThrow(/duplicate frames/);
		expect(() =>
			validateSelectedFrames({frames: [10], durationInFrames: 10}),
		).toThrow(/out of range/);
	});
});
