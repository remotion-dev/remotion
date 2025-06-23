import {expect, test} from 'bun:test';
import {parseStsc} from '../containers/iso-base-media/stsd/stsc';
import {getArrayBufferIterator} from '../iterator/buffer-iterator';

test('Parse stsc box', () => {
	const buffer = Uint8Array.from([
		// mock header
		0, 0, 0, 0, 0, 0, 0, 0,
		// actual box
		0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 2, 0,
		0, 0, 1, 0, 0, 0, 1,
	]);

	const iterator = getArrayBufferIterator({
		initialData: buffer,
		maxBytes: buffer.length,
		logLevel: 'error',
	});
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
		entries: new Map([
			[1, 2],
			[2, 1],
		]),
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

	const iterator = getArrayBufferIterator({
		initialData: buffer,
		maxBytes: buffer.length,
		logLevel: 'error',
	});
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
		entries: new Map([
			[1, 1],
			[2, 2],
			[3, 1],
			[4, 2],
			[5, 1],
			[7, 2],
			[8, 1],
			[9, 4],
		]),
	});
});
