import {expect, test} from 'bun:test';
import {parseEbml} from '../containers/webm/parse-ebml';
import {getArrayBufferIterator} from '../iterator/buffer-iterator';

const unknownElementId = [0x00, 0x00, 0x00, 0x00];
// 0x01 starts an 8-byte length; all ones is the unknown-size sentinel.
const unknownSize = [0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff];

const makeIterator = (bytes: number[]) =>
	getArrayBufferIterator({
		initialData: new Uint8Array(bytes),
		maxBytes: 1024,
		logLevel: 'error',
	});

test('an unknown element with unknown size does not poison the iterator offset', async () => {
	const bytes = [...unknownElementId, ...unknownSize];
	const iterator = makeIterator(bytes);

	await parseEbml(iterator, null, 'error');

	expect(iterator.counter.getOffset()).toBe(bytes.length);
	expect(Number.isFinite(iterator.counter.getOffset())).toBe(true);
});

test('an unknown element with a size larger than the buffer lands at the end', async () => {
	// Size vint 0x50 = 256 bytes declared, only 4 bytes present.
	const bytes = [...unknownElementId, 0x50, 1, 2, 3, 4];
	const iterator = makeIterator(bytes);

	await parseEbml(iterator, null, 'error');

	expect(iterator.counter.getOffset()).toBe(bytes.length);
});

test('an unknown element with a valid size skips exactly that many bytes', async () => {
	const bytes = [...unknownElementId, 0x84, 1, 2, 3, 4, 9, 9, 9, 9];
	const iterator = makeIterator(bytes);

	await parseEbml(iterator, null, 'error');

	expect(iterator.counter.getOffset()).toBe(4 + 1 + 4);
});
