import {describe, expect, it} from 'vitest';
import {getNextFrame} from '../utils';

describe('getNextFrame', () => {
	describe('when loop is falsy', () => {
		it('returns the current frame if smaller than total frames', () => {
			expect(getNextFrame(23, 56)).toBe(23);
		});

		it('returns the last frame if current frame is bigger than total frames', () => {
			expect(getNextFrame(23, 20)).toBe(20);
		});
	});

	describe('when loop is truthy', () => {
		it('returns the current frame if smaller than total frames', () => {
			expect(getNextFrame(23, 56, true)).toBe(23);
		});

		it('returns the last frame if current frame is bigger than total frames', () => {
			expect(getNextFrame(23, 20, true)).toBe(3);
		});
	});
});
