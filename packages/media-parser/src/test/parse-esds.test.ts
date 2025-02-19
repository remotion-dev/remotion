import {expect, test} from 'bun:test';
import {getArrayBufferIterator} from '../buffer-iterator';
import {parseEsds} from '../containers/iso-base-media/esds/esds';

test('Parse ESDS box', () => {
	const buf = new Uint8Array([
		// mock header
		0, 0, 0, 0, 0, 0, 0, 0,
		// actual box
		0, 0, 0, 0, 3, 128, 128, 128, 27, 0, 2, 0, 4, 128, 128, 128, 13, 107, 21, 0,
		0, 0, 0, 4, 226, 0, 0, 4, 226, 0, 6, 128, 128, 128, 1, 2,
	]);

	const iter = getArrayBufferIterator(buf, null);
	iter.counter.increment(8);

	expect(
		parseEsds({
			data: iter,
			fileOffset: 8,
			size: buf.length - 8,
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
				asNumber: 107,
				bufferSizeDB: 0,
				streamType: 5,
				upStream: 0,
				avgBitrate: 320000,
				maxBitrate: 320000,
				decoderSpecificConfigs: [],
			},
			{
				type: 'sl-config-descriptor',
			},
		],
	});
});

test('Parse two ESDS', () => {
	const buf = new Uint8Array([
		// mock header
		0, 0, 0, 0, 0, 0, 0, 0,
		// actual box
		0, 0, 0, 0, 3, 25, 0, 0, 0, 4, 17, 64, 21, 0, 24, 0, 0, 4, 226, 0, 0, 4,
		226, 0, 5, 2, 17, 144, 6, 1, 2, 0, 0, 0, 24, 115, 116, 116, 115,
	]);

	const iter = getArrayBufferIterator(buf, null);
	iter.counter.increment(8);

	expect(
		parseEsds({
			data: iter,
			fileOffset: 8,
			size: buf.length - 8,
		}),
	).toEqual({
		type: 'esds-box',
		version: 0,
		tag: 3,
		sizeOfInstance: 25,
		esId: 0,
		descriptors: [
			{
				objectTypeIndication: 'aac',
				type: 'decoder-config-descriptor',
				asNumber: 64,
				bufferSizeDB: 6144,
				streamType: 5,
				upStream: 0,
				avgBitrate: 320000,
				maxBitrate: 320000,
				decoderSpecificConfigs: [
					{
						audioObjectType: 2,
						channelConfiguration: 2,
						samplingFrequencyIndex: 3,
						type: 'mp4a-specific-config',
						asBytes: new Uint8Array([17, 144]),
					},
				],
			},
			{
				type: 'sl-config-descriptor',
			},
		],
	});
});
