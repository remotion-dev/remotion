import {expect, test} from 'bun:test';
import {getArrayBufferIterator} from '../buffer-iterator';
import {parseStsz} from '../containers/iso-base-media/stsd/stsz';

test('parse stsz box 1', () => {
	const buf = new Uint8Array([
		// mock header
		0, 0, 0, 0, 0, 0, 0, 0,
		// actual box
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 18, 226, 0, 0, 1, 181, 0, 0, 2,
		186, 0, 0, 2, 83, 0, 0, 2, 36, 0, 0, 2, 99, 0, 0, 2, 189, 0, 0, 2, 23, 0, 0,
		3, 8, 0, 0, 2, 74, 0, 0, 0, 52, 115, 116, 99, 111,
	]);
	const iterator = getArrayBufferIterator(buf, null);
	iterator.counter.increment(8);
	const result = parseStsz({
		iterator,
		size: buf.length - 8,
		offset: 0,
	});
	expect(result).toEqual({
		type: 'stsz-box',
		boxSize: 60,
		offset: 0,
		version: 0,
		flags: [0, 0, 0],
		sampleCount: 10,
		countType: 'variable',
		entries: [4834, 437, 698, 595, 548, 611, 701, 535, 776, 586],
	});
});

test('parse stsz box 2', () => {
	const buf = new Uint8Array([
		// mock header
		0, 0, 0, 0, 0, 0, 0, 0,
		// actual box
		0, 0, 0, 0, 0, 0, 3, 192, 0, 0, 0, 15, 0, 0, 0, 52, 115, 116, 99, 111,
	]);
	const iterator = getArrayBufferIterator(buf, null);
	iterator.counter.increment(8);
	const result = parseStsz({
		iterator,
		size: buf.length - 8,
		offset: 0,
	});
	expect(result).toEqual({
		type: 'stsz-box',
		boxSize: 20,
		offset: 0,
		version: 0,
		flags: [0, 0, 0],
		sampleCount: 15,
		sampleSize: 960,
		countType: 'fixed',
	});
});
