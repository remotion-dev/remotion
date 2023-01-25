import {expect, test} from 'vitest';
import {planFrameRanges} from '../../functions/chunk-optimization/plan-frame-ranges';

test('Plan frame ranges should respect everyNthFrame', () => {
	const planned = planFrameRanges({
		framesPerLambda: 8,
		everyNthFrame: 2,
		frameRange: [0, 99],
	});
	expect(planned.chunks).toEqual([
		[0, 15],
		[16, 31],
		[32, 47],
		[48, 63],
		[64, 79],
		[80, 95],
		[96, 98],
	]);
});

test('Should remove ranges that are not going to render', () => {
	const planned = planFrameRanges({
		framesPerLambda: 11,
		everyNthFrame: 1,
		frameRange: [0, 22],
	});
	expect(planned.chunks).toEqual([
		[0, 10],
		[11, 21],
		[22, 22],
	]);
});
