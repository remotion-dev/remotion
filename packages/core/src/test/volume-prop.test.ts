import {describe, expect, test} from 'bun:test';
import {evaluateVolume} from '../volume-prop.js';
import {expectToThrow} from './expect-to-throw.js';

describe('EvaluateVolume does not throw', () => {
	test('Volume is undefined', () => {
		const toEvaluate = {
			frame: 10,
			volume: undefined,
			mediaVolume: 1,
			allowAmplificationDuringRender: false,
		};
		expect(evaluateVolume(toEvaluate)).toEqual(1);
	});
	test('Volume is smaller than one', () => {
		const smallVolume = 0.5;
		const toEvaluate = {
			frame: 10,
			volume: smallVolume,
			mediaVolume: 1,
			allowAmplificationDuringRender: false,
		};
		expect(evaluateVolume(toEvaluate)).toEqual(smallVolume);
	});
	test('Volume is bigger than one', () => {
		const toEvaluate = {
			frame: 10,
			volume: 10,
			mediaVolume: 1,
			allowAmplificationDuringRender: true,
		};
		expect(evaluateVolume(toEvaluate)).toBe(10);
	});
	test('evaluated volume from frame that is smaller than one', () => {
		const toEvaluate = {
			frame: 1,
			volume: (frame: number) => frame * 0.5,
			mediaVolume: 1,
			allowAmplificationDuringRender: false,
		};
		expect(evaluateVolume(toEvaluate)).toBe(0.5);
	});
	test('evaluated volume from frame that is bigger than one', () => {
		const toEvaluate = {
			frame: 10,
			volume: (frame: number) => frame,
			mediaVolume: 1,
			allowAmplificationDuringRender: false,
		};
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
		const toEvaluate = {frame: 1, volume: () => invalidVolume, mediaVolume: 1};

		// changing the test because string multiply by a number in javascript is `NaN`
		expectToThrow(() => {
			// @ts-expect-error
			evaluateVolume(toEvaluate);
		}, /You passed in a function to the volume prop but it returned NaN for frame 1./);
	});
	test('It should throw if volume is NaN', () => {
		const invalidVolume = NaN;
		const toEvaluate = {
			frame: 1,
			volume: () => invalidVolume,
			mediaVolume: 1,
			allowAmplificationDuringRender: false,
		};
		expectToThrow(() => {
			evaluateVolume(toEvaluate);
		}, /You passed in a function to the volume prop but it returned NaN for frame 1/);
	});
	test('It should throw if volume returns non finite number', () => {
		const invalidVolume = Infinity;
		const toEvaluate = {
			frame: 1,
			volume: () => invalidVolume,
			mediaVolume: 1,
			allowAmplificationDuringRender: false,
		};
		expectToThrow(() => {
			evaluateVolume(toEvaluate);
		}, /You passed in a function to the volume prop but it returned a non-finite number for frame 1/);
	});
});
