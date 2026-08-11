import {expect, test} from 'bun:test';
import {getFramesToRender} from '../get-duration-from-frame-range';

test('everyNthFrame=1 returns all frames', () => {
	expect(getFramesToRender([0, 5], 1)).toEqual([0, 1, 2, 3, 4, 5]);
});

test('everyNthFrame=2 starting at 0 returns 0, 2, 4', () => {
	expect(getFramesToRender([0, 5], 2)).toEqual([0, 2, 4]);
});

test('everyNthFrame=3 starting at 0 returns 0, 3', () => {
	expect(getFramesToRender([0, 5], 3)).toEqual([0, 3]);
});

test('First frame of the range is always included', () => {
	expect(getFramesToRender([5, 5], 2)).toEqual([5]);
});

test('everyNthFrame offsets from the start of the range', () => {
	expect(getFramesToRender([5, 10], 2)).toEqual([5, 7, 9]);
});

test('everyNthFrame=2 with odd start still includes first frame', () => {
	expect(getFramesToRender([3, 9], 2)).toEqual([3, 5, 7, 9]);
});

test('everyNthFrame=3 with non-zero start', () => {
	expect(getFramesToRender([1, 10], 3)).toEqual([1, 4, 7, 10]);
});

test('Single frame range always returns that frame', () => {
	expect(getFramesToRender([7, 7], 1)).toEqual([7]);
	expect(getFramesToRender([7, 7], 3)).toEqual([7]);
	expect(getFramesToRender([7, 7], 100)).toEqual([7]);
});

test('everyNthFrame=0 throws', () => {
	expect(() => getFramesToRender([0, 5], 0)).toThrow(
		'everyNthFrame cannot be 0',
	);
});
