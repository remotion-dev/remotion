import {expect, test} from 'bun:test';
import {getArrayBufferIterator} from '../buffer-iterator';
import {parseStts} from '../containers/iso-base-media/stsd/stts';

const buffer = new Uint8Array([
	// mock header
	0, 0, 0, 0, 0, 0, 0, 0,
	// actual box
	0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1, 13, 0, 0, 0, 20, 0, 0, 0, 1, 0, 0, 0, 21, 0,
	0, 0, 107, 0, 0, 0, 20, 0, 0, 11, 216, 99, 116, 116, 115,
]);

test('Should parse stts box', () => {
	const iterator = getArrayBufferIterator(buffer, null);
	iterator.counter.increment(8);
	const result = parseStts({
		data: iterator,
		size: buffer.length - 8,
		fileOffset: 0,
	});
	expect(result).toEqual({
		type: 'stts-box',
		sampleDistribution: [
			{
				sampleCount: 269,
				sampleDelta: 20,
			},
			{
				sampleCount: 1,
				sampleDelta: 21,
			},
			{
				sampleCount: 107,
				sampleDelta: 20,
			},
		],
	});
});
