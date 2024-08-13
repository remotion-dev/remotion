import {expect, test} from 'bun:test';
import {processSample} from '../boxes/iso-base-media/stsd/samples';
import {parseStsd} from '../boxes/iso-base-media/stsd/stsd';
import {getArrayBufferIterator} from '../buffer-iterator';
import {makeParserState} from '../parser-state';

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
		// revision level
		0, 0, 0, 0, 0, 0,
		// revision level
		0, 2, 0, 16, 255, 254, 0, 0, 172, 68, 0, 0, 0, 0, 4, 0, 0, 0, 0, 1, 0, 0, 0,
		2, 0, 0, 0, 2, 0, 0, 0, 91, 119, 97, 118, 101, 0, 0, 0, 12, 102, 114, 109,
		97, 109, 112, 52, 97, 0, 0, 0, 12, 109, 112, 52, 97, 0, 0, 0, 0, 0, 0, 0,
		51, 101, 115, 100, 115, 0, 0, 0, 0, 3, 128, 128, 128, 34, 0, 0, 0, 4, 128,
		128, 128, 20, 64, 20, 0, 24, 0, 0, 2, 238, 0, 0, 0, 0, 0, 5, 128, 128, 128,
		2, 18, 16, 6, 128, 128, 128, 1, 2, 0, 0, 0, 8, 0, 0, 0, 0,
	]);

	const iterator = getArrayBufferIterator(buffer);
	iterator.discard(8);

	const parsed = parseStsd({
		iterator,
		offset: 0,
		size: 159,
		options: {
			canSkipVideoData: true,
			onAudioTrack: null,
			onVideoTrack: null,
			parserState: makeParserState({
				hasAudioCallbacks: false,
				hasVideoCallbacks: false,
			}),
		},
	});

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
				compressionId: -2,
				packetSize: 0,
				samplesPerPacket: 1024,
				bitsPerSample: 2,
				bytesPerFrame: 2,
				bytesPerPacket: 1,
				sampleRate: 44100,
				children: [
					{
						boxSize: 91,
						boxType: 'wave',
						children: [
							{
								boxSize: 12,
								boxType: 'frma',
								children: [],
								offset: 76,
								type: 'regular-box',
							},
							{
								boxSize: 12,
								boxType: 'mp4a',
								children: [],
								offset: 88,
								type: 'regular-box',
							},
							{
								descriptors: [
									{
										objectTypeIndication: 'aac',
										type: 'decoder-config-descriptor',
										asNumber: 64,
										avgBitrate: 0,
										bufferSizeDB: 6144,
										maxBitrate: 192000,
										streamType: 5,
										decoderSpecificConfigs: [
											{
												audioObjectType: 2,
												channelConfiguration: 2,
												samplingFrequencyIndex: 4,
												type: 'audio-specific-config',
												asBytes: new Uint8Array([18, 16]),
											},
											{
												type: 'unknown-decoder-specific-config',
											},
										],
										upStream: 0,
									},
								],
								esId: 0,
								sizeOfInstance: 34,
								tag: 3,
								type: 'esds-box',
								version: 0,
							},
							{
								boxSize: 8,
								boxType: '\u0000\u0000\u0000\u0000',
								children: [],
								offset: 151,
								type: 'regular-box',
							},
						],
						offset: 68,
						type: 'regular-box',
					},
				],
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
		options: {
			canSkipVideoData: true,
			onAudioTrack: null,
			onVideoTrack: null,
			parserState: makeParserState({
				hasAudioCallbacks: false,
				hasVideoCallbacks: false,
			}),
		},
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
		descriptors: [
			{
				data: new Uint8Array([
					1, 100, 0, 32, 255, 225, 0, 27, 103, 100, 0, 32, 172, 217, 64, 68, 2,
					39, 150, 92, 4, 64, 0, 0, 3, 0, 64, 0, 0, 12, 3, 198, 12, 101, 128, 1,
					0, 6, 104, 235, 224, 140, 178, 44, 253, 248, 248, 0,
				]),
				type: 'avcc-box',
				configurationString: '640020',
			},
			{
				boxSize: 16,
				offset: 142,
				type: 'pasp-box',
				hSpacing: 1,
				vSpacing: 1,
			},
		],
	});
});
