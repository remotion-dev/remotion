import {expect, test} from 'bun:test';
import {planFrameRanges} from '../plan-frame-ranges';

test('Plan frame ranges should respect everyNthFrame', () => {
	const planned = planFrameRanges({
		framesPerFunction: 8,
		everyNthFrame: 2,
		frameRanges: [[0, 99]],
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
		framesPerFunction: 11,
		everyNthFrame: 1,
		frameRanges: [[0, 22]],
	});
	expect(planned.chunks).toEqual([
		[0, 10],
		[11, 21],
		[22, 22],
	]);
});

test('Should not have a bug that was reported', () => {
	const planned = planFrameRanges({
		framesPerFunction: 138,
		everyNthFrame: 1,
		frameRanges: [[15000, 35559]],
	});
	const last = planned.chunks[planned.chunks.length - 1];
	expect(last[1]).toBe(35559);
});

test('Should plan multiple frame ranges without rendering the gaps', () => {
	const planned = planFrameRanges({
		framesPerFunction: 3,
		everyNthFrame: 1,
		frameRanges: [
			[0, 4],
			[10, 13],
		],
	});
	expect(planned.chunks).toEqual([
		[0, 2],
		[3, 4],
		[10, 12],
		[13, 13],
	]);
});
