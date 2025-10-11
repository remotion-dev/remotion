import {expect, test} from 'bun:test';
import {bestFramesPerFunctionParam} from '../best-frames-per-function-param';

test('Get reasonable framesPerFunction defaults', () => {
	expect(bestFramesPerFunctionParam(20)).toEqual(20);
	expect(bestFramesPerFunctionParam(21)).toEqual(11);
	expect(bestFramesPerFunctionParam(100)).toEqual(20);
	expect(bestFramesPerFunctionParam(2000)).toEqual(24);
	expect(bestFramesPerFunctionParam(4000)).toEqual(44);
	expect(bestFramesPerFunctionParam(8000)).toEqual(74);
	expect(bestFramesPerFunctionParam(10000)).toEqual(86);
	expect(bestFramesPerFunctionParam(14000)).toEqual(105);
	expect(bestFramesPerFunctionParam(18000)).toEqual(120);
	expect(bestFramesPerFunctionParam(216000)).toEqual(1440);
});
