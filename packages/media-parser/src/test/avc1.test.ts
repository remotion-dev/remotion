import {expect, test} from 'bun:test';
import {createAvc1Data} from '../create/iso-base-media/codec-specific/avc1';
import {createAvccBox} from '../create/iso-base-media/trak/mdia/minf/stbl/stsd/create-avcc';
import {createPasp} from '../create/iso-base-media/trak/mdia/minf/stbl/stsd/create-pasp';

// bun segfaults here
if (process.platform !== 'win32') {
	const reference = new Uint8Array([
		0, 0, 0, 161, 97, 118, 99, 49, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 128, 1, 104, 0, 72, 0, 0, 0, 72, 0, 0, 0, 0,
		0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 255, 255, 0, 0, 0, 59, 97, 118, 99,
		67, 1, 100, 0, 30, 255, 225, 0, 30, 103, 100, 0, 30, 172, 217, 64, 160, 47,
		249, 112, 22, 224, 64, 64, 180, 160, 0, 0, 3, 0, 32, 0, 0, 7, 129, 226, 197,
		178, 192, 1, 0, 6, 104, 235, 224, 140, 178, 44, 253, 248, 248, 0, 0, 0, 0,
		16, 112, 97, 115, 112, 0, 0, 0, 1, 0, 0, 0, 1,
	]);

	test('create avc1box', () => {
		const privateData = new Uint8Array([
			0x01, 0x64, 0x00, 0x1e, 0xff, 0xe1, 0x00, 0x1e, 0x67, 0x64, 0x00, 0x1e,
			0xac, 0xd9, 0x40, 0xa0, 0x2f, 0xf9, 0x70, 0x16, 0xe0, 0x40, 0x40, 0xb4,
			0xa0, 0x00, 0x00, 0x03, 0x00, 0x20, 0x00, 0x00, 0x07, 0x81, 0xe2, 0xc5,
			0xb2, 0xc0, 0x01, 0x00, 0x06, 0x68, 0xeb, 0xe0, 0x8c, 0xb2, 0x2c, 0xfd,
			0xf8, 0xf8, 0x00,
		]);
		expect(
			createAvc1Data({
				pasp: createPasp(1, 1),
				avccBox: createAvccBox(privateData),
				width: 640,
				height: 360,
				horizontalResolution: 72,
				verticalResolution: 72,
				compressorName: '',
				depth: 24,
				type: 'avc1-data',
			}),
		).toEqual(reference);
	});
}
