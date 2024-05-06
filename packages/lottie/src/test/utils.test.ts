import {describe, expect, it} from 'bun:test';
import {getLottieFrame} from '../utils';

describe('getNextFrame', () => {
	describe('when loop is falsy', () => {
		it('returns the current frame if smaller than total frames', () => {
			expect(getLottieFrame({currentFrame: 23, totalFrames: 56})).toBe(23);
		});

		it('returns the last frame if current frame is bigger than total frames', () => {
			expect(getLottieFrame({currentFrame: 23, totalFrames: 20})).toBe(20);
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
			).toBe(0);
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
