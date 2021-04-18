import {evaluateVolume} from '../volume-prop';
import {expectToThrow} from './expect-to-throw';

describe('EvaluateVolume does not throw', () => {
	test('Volume is undefined', () => {
		const toEvaluate = {frame: 10, volume: undefined};
		expect(evaluateVolume(toEvaluate)).toEqual(1);
	});
	test('Volume is smaller than one', () => {
		const smallVolume = 0.5;
		const toEvaluate = {frame: 10, volume: smallVolume};
		expect(evaluateVolume(toEvaluate)).toEqual(smallVolume);
	});
	test('Volume is bigger than one', () => {
		const toEvaluate = {frame: 10, volume: 10};
		expect(evaluateVolume(toEvaluate)).toBe(1);
	});
	test('evaluated volume from frame that is smaller than one', () => {
		const smallFrame = 0.5;
		const toEvaluate = {frame: smallFrame, volume: (frame: number) => frame};
		expect(evaluateVolume(toEvaluate)).toBe(smallFrame);
	});
	test('evaluated volume from frame that is bigger than one', () => {
		const toEvaluate = {frame: 10, volume: (frame: number) => frame};
		expect(evaluateVolume(toEvaluate)).toBe(1);
	});
});

describe('EvaluateVolume throws exception', () => {
	test('It should throw if volume prop is neither number nor undefined', () => {
		const toEvaluate = {frame: 10, volume: 'NaN'};
		expectToThrow(() => {
			// @ts-expect-error
			evaluateVolume(toEvaluate);
		}, /volume is not a function/);
	});
	test('It should throw if frame is invalid type', () => {
		const invalidFrame = 'NaN';
		const toEvaluate = {frame: invalidFrame, volume: (frame: any) => frame};
		expectToThrow(() => {
			// @ts-expect-error
			evaluateVolume(toEvaluate);
		}, new RegExp(`You passed in a a function to the volume prop but it did not return a number but a vaue of type ${typeof invalidFrame} for frame ${invalidFrame}`));
	});
});
