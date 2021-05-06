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
		const toEvaluate = {frame: 1, volume: (frame: number) => frame * 0.5};
		expect(evaluateVolume(toEvaluate)).toBe(0.5);
	});
	test('evaluated volume from frame that is bigger than one', () => {
		const toEvaluate = {frame: 10, volume: (frame: number) => frame};
		expect(evaluateVolume(toEvaluate)).toBe(1);
	});
});

describe('evaluateVolume throws exception', () => {
	test('It should throw if volume prop is neither number nor undefined', () => {
		const toEvaluate = {frame: 10, volume: 'NaN'};
		expectToThrow(() => {
			// @ts-expect-error
			evaluateVolume(toEvaluate);
		}, /volume is not a function/);
	});
	test('It should throw if volume is invalid type', () => {
		const invalidVolume = 'anystring';
		const toEvaluate = {frame: 1, volume: () => invalidVolume};
		expectToThrow(() => {
			// @ts-expect-error
			evaluateVolume(toEvaluate);
		}, new RegExp(`You passed in a a function to the volume prop but it did not return a number but a value of type ${typeof invalidVolume} for frame 1`));
	});
	test('It should throw if volume is NaN', () => {
		const invalidVolume = NaN;
		const toEvaluate = {frame: 1, volume: () => invalidVolume};
		expectToThrow(() => {
			evaluateVolume(toEvaluate);
		}, /You passed in a function to the volume prop but it returned NaN for frame 1/);
	});
	test('It should throw if volume returns non finite number', () => {
		const invalidVolume = Infinity;
		const toEvaluate = {frame: 1, volume: () => invalidVolume};
		expectToThrow(() => {
			evaluateVolume(toEvaluate);
		}, /You passed in a function to the volume prop but it returned a non-finite number for frame 1/);
	});
});
