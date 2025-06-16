import {describe, expect, it} from 'bun:test';
import {getLottieFrame} from '../utils';

describe('getNextFrame', () => {
	describe('when loop is falsy', () => {
		it('returns the current frame if smaller than total frames', () => {
			expect(getLottieFrame({currentFrame: 23, totalFrames: 56})).toBe(23);
		});

		it('returns the last frame if current frame is bigger than total frames', () => {
			expect(getLottieFrame({currentFrame: 23, totalFrames: 20})).toBe(19);
		});

		it('freezes on last valid frame to prevent animation disappearing', () => {
			// This test specifically validates the fix for the issue where
			// non-looping animations disappear after playing once
			expect(getLottieFrame({currentFrame: 100, totalFrames: 30})).toBe(29);
			expect(getLottieFrame({currentFrame: 1000, totalFrames: 60})).toBe(59);
		});
	});

	describe('when loop is truthy', () => {
		it('returns the current frame if smaller than total frames', () => {
			expect(
				getLottieFrame({currentFrame: 23, totalFrames: 56, loop: true}),
			).toBe(23);
		});

		it('returns the modulo if current frame is bigger than total frames', () => {
			expect(
				getLottieFrame({currentFrame: 23, totalFrames: 20, loop: true}),
			).toBe(3);
		});
	});

	describe('when direction is reverse and loop is falsy', () => {
		it('returns the correct frame if current frame is smaller than total frames', () => {
			expect(
				getLottieFrame({
					currentFrame: 15,
					totalFrames: 20,
					direction: 'backward',
				}),
			).toBe(5);
		});

		it('returns frame zero if current frame is bigger than total frames', () => {
			expect(
				getLottieFrame({
					currentFrame: 23,
					totalFrames: 20,
					direction: 'backward',
				}),
			).toBe(1);
		});
	});

	describe('when direction is reverse and loop is truthy', () => {
		it('returns the correct frame if current frame is smaller than total frames', () => {
			expect(
				getLottieFrame({
					currentFrame: 15,
					totalFrames: 20,
					direction: 'backward',
					loop: true,
				}),
			).toBe(5);
		});

		it('returns (total-overflow) if current frame is bigger than total frames', () => {
			expect(
				getLottieFrame({
					currentFrame: 23,
					totalFrames: 20,
					direction: 'backward',
					loop: true,
				}),
			).toBe(17);
		});
	});
});
