import {expect, test} from 'bun:test';
import {getArrayBufferIterator} from '../buffer-iterator';
import {parseStco} from '../containers/iso-base-media/stsd/stco';

test('Parse stco box', () => {
	const buf = new Uint8Array([
		// mock header
		0, 0, 0, 0, 0, 0, 0, 0,
		// actual box
		0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 26, 252, 0, 0, 33, 118, 0, 0, 43, 73, 0, 0,
		49, 45, 0, 0, 59, 16, 0, 0, 65, 141, 0, 0, 71, 100, 0, 0, 81, 236, 0, 0, 87,
		246,
	]);

	const iterator = getArrayBufferIterator(buf, null);
	iterator.counter.increment(8);
	const result = parseStco({
		iterator,
		size: buf.length - 8,
		offset: 0,
		mode64Bit: false,
	});
	expect(result).toEqual({
		type: 'stco-box',
		boxSize: 44,
		offset: 0,
		version: 0,
		flags: [0, 0, 0],
		entryCount: 9,
		entries: [6908, 8566, 11081, 12589, 15120, 16781, 18276],
	});
});

test('Parse stco box with empty chunk', () => {
	const buf = new Uint8Array([
		// mock header
		0, 0, 0, 0, 0, 0, 0, 0,
		// actual box
		0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 6, 101, 0, 0, 30, 188, 0, 0, 40, 246, 0, 0,
		47, 9, 0, 0, 56, 173, 0, 0, 62, 208, 0, 0, 69, 77, 0, 0, 78, 228, 0, 0, 85,
		172,
	]);

	const iterator = getArrayBufferIterator(buf, null);
	iterator.counter.increment(8);
	const result = parseStco({
		iterator,
		size: buf.length - 8,
		offset: 0,
		mode64Bit: false,
	});
	expect(result).toEqual({
		type: 'stco-box',
		boxSize: 44,
		offset: 0,
		version: 0,
		flags: [0, 0, 0],
		entryCount: 9,
		entries: [1637, 7868, 10486, 12041, 14509, 16080, 17741],
	});
});
