import {expect, test} from 'bun:test';
import {parseEsds} from '../boxes/iso-base-media/esds';
import {getArrayBufferIterator} from '../buffer-iterator';

test('Parse ESDS box', () => {
	const buf = new Uint8Array([
		0, 0, 0, 0, 3, 128, 128, 128, 27, 0, 2, 0, 4, 128, 128, 128, 13, 107, 21, 0,
		0, 0, 0, 4, 226, 0, 0, 4, 226, 0, 6, 128, 128, 128, 1, 2,
	]);
	expect(
		parseEsds({
			data: getArrayBufferIterator(buf),
			fileOffset: 0,
			size: buf.length + 8,
		}),
	).toEqual({
		type: 'esds-box',
		version: 0,
		tag: 3,
		sizeOfInstance: 27,
		esId: 2,
		descriptors: [
			{
				type: 'decoder-config-descriptor',
				objectTypeIndication: 'mp3',
			},
			{
				type: 'sl-config-descriptor',
			},
		],
	});
});
