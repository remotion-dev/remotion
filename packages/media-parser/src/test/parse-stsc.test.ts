import {expect, test} from 'bun:test';
import {getArrayBufferIterator} from '../buffer-iterator';
import {parseStsc} from '../containers/iso-base-media/stsd/stsc';

test('Parse stsc box', () => {
	const buffer = Uint8Array.from([
		// mock header
		0, 0, 0, 0, 0, 0, 0, 0,
		// actual box
		0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 2, 0,
		0, 0, 1, 0, 0, 0, 1,
	]);

	const iterator = getArrayBufferIterator(buffer, null);
	iterator.counter.increment(8);
	const result = parseStsc({
		iterator,
		offset: 0,
		size: buffer.length - 8,
	});

	expect(result).toEqual({
		boxSize: 32,
		flags: [0, 0, 0],
		offset: 0,
		type: 'stsc-box',
		version: 0,
		entryCount: 2,
		entries: [
			{
				firstChunk: 1,
				samplesPerChunk: 2,
			},
			{
				firstChunk: 2,
				samplesPerChunk: 1,
			},
		],
	});
});

test('Parse stsc box 2', () => {
	const buffer = Uint8Array.from([
		// mock header
		0, 0, 0, 0, 0, 0, 0, 0,
		// actual box
		0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 2, 0,
		0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 4, 0, 0,
		0, 2, 0, 0, 0, 1, 0, 0, 0, 5, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 7, 0, 0, 0,
		2, 0, 0, 0, 1, 0, 0, 0, 8, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 9, 0, 0, 0, 4,
		0, 0, 0, 1,
	]);

	const iterator = getArrayBufferIterator(buffer, null);
	iterator.counter.increment(8);
	const result = parseStsc({
		iterator,
		offset: 0,
		size: buffer.length - 8,
	});

	expect(result).toEqual({
		boxSize: 104,
		flags: [0, 0, 0],
		offset: 0,
		type: 'stsc-box',
		version: 0,
		entryCount: 8,
		entries: [
			{
				firstChunk: 1,
				samplesPerChunk: 1,
			},
			{
				firstChunk: 2,
				samplesPerChunk: 2,
			},
			{
				firstChunk: 3,
				samplesPerChunk: 1,
			},
			{
				firstChunk: 4,
				samplesPerChunk: 2,
			},
			{
				firstChunk: 5,
				samplesPerChunk: 1,
			},
			{
				firstChunk: 7,
				samplesPerChunk: 2,
			},
			{
				firstChunk: 8,
				samplesPerChunk: 1,
			},
			{
				firstChunk: 9,
				samplesPerChunk: 4,
			},
		],
	});
});
