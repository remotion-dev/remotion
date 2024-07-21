import {expect, test} from 'bun:test';
import {processSample} from '../boxes/iso-base-media/stsd/samples';
import {parseStsd} from '../boxes/iso-base-media/stsd/stsd';
import {getArrayBufferIterator} from '../read-and-increment-offset';

test('Should be able to parse a STSD audio box correctly', () => {
	const buffer = Uint8Array.from([
		// box size
		0, 0, 0, 159,
		// data format "stsd"
		115, 116, 115, 100,
		// reserved
		0, 0, 0, 0, 0, 0,
		// number of entries
		0, 1,
		// size
		0, 0, 0, 143,
		// "mp4a"
		109, 112, 52, 97,
		// reserved
		0, 0, 0, 0, 0, 0,
		// data reference index
		0, 1,
		// version
		0, 1,
		// revisioon level
		0, 0, 0, 0, 0, 0,
		// revision level
		0, 2, 0, 16, 255, 254, 0, 0, 172, 68, 0, 0, 0, 0, 4, 0, 0, 0, 0, 1, 0, 0, 0,
		2, 0, 0, 0, 2, 0, 0, 0, 91, 119, 97, 118, 101, 0, 0, 0, 12, 102, 114, 109,
		97, 109, 112, 52, 97, 0, 0, 0, 12, 109, 112, 52, 97, 0, 0, 0, 0, 0, 0, 0,
		51, 101, 115, 100, 115, 0, 0, 0, 0, 3, 128, 128, 128, 34, 0, 0, 0, 4, 128,
		128, 128, 20, 64, 20, 0, 24, 0, 0, 2, 238, 0, 0, 0, 0, 0, 5, 128, 128, 128,
		2, 18, 16, 6, 128, 128, 128, 1, 2, 0, 0, 0, 8, 0, 0, 0, 0,
	]);

	const parsed = parseStsd(getArrayBufferIterator(buffer));

	expect(parsed).toEqual({
		offset: 0,
		boxSize: 159,
		type: 'stsd-box',
		numberOfEntries: 1,
		samples: [
			{
				size: 143,
				offset: 16,
				format: 'mp4a',
				dataReferenceIndex: 1,
				version: 1,
				revisionLevel: 0,
				vendor: [0, 0, 0, 0],
				numberOfChannels: 2,
				type: 'audio',
				sampleSize: 16,
				compressionId: 65534,
				packetSize: 0,
				samplesPerPacket: 0,
				bitsPerSample: 1,
				bytesPerFrame: 0,
				bytesPerPacket: 1024,
				sampleRate: 44100,
			},
		],
	});
});

test('Should be able to parse a STSD video box correctly', () => {
	const buffer = Uint8Array.from([
		// box size
		0, 0, 0, 158,
		// data format "avc1"
		97, 118, 99, 49,
		// padding
		0, 0, 0, 0, 0, 0,
		// data reference index
		0, 1,
		// version
		0, 0,
		// revision level
		0, 0,
		// vendor
		0, 0, 0, 0,
		// temporal quality
		0, 0, 0, 0,
		// spatial quality
		0, 0, 0, 0,
		// width
		4, 56,
		// height
		4, 56,
		// horiz resolution
		0, 72, 0, 0,
		// vert resolution
		0, 72, 0, 0,
		// frame count
		0, 0,
		// compressor name
		// 0
		0, 0, 0, 1,
		// 1
		0, 0, 0, 0,
		// 2
		0, 0, 0, 0,
		// 3
		0, 0, 0, 0,
		// 4
		0, 0, 0, 0,
		// 5
		0, 0, 0, 0,
		// 6
		0, 0, 0, 0,
		// 7
		0, 0, 0, 0,
		// 8
		0, 0, 0, 0,
		// depth
		0, 24,
		// color space
		255, 255,
		// avcC info (not parsed)
		0, 0, 0, 56, 97, 118, 99, 67, 1, 100, 0, 32, 255, 225, 0, 27, 103, 100, 0,
		32, 172, 217, 64, 68, 2, 39, 150, 92, 4, 64, 0, 0, 3, 0, 64, 0, 0, 12, 3,
		198, 12, 101, 128, 1, 0, 6, 104, 235, 224, 140, 178, 44, 253, 248, 248, 0,
		0, 0, 0, 16, 112, 97, 115, 112, 0, 0, 0, 1, 0, 0, 0, 1,
	]);

	const parsed = processSample({
		iterator: getArrayBufferIterator(buffer),
	});
	expect(parsed.sample).toEqual({
		size: 158,
		format: 'avc1',
		dataReferenceIndex: 1,
		version: 0,
		revisionLevel: 0,
		vendor: [0, 0, 0, 0],
		type: 'video',
		temporalQuality: 0,
		spacialQuality: 0,
		width: 1080,
		height: 1080,
		horizontalResolutionPpi: 72,
		verticalResolutionPpi: 72,
		dataSize: 0,
		frameCountPerSample: 1,
		compressorName: [
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0,
		],
		offset: 0,
		depth: 24,
		colorTableId: -1,
	});
});
