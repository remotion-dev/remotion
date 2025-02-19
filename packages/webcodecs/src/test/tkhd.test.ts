import {MediaParserInternals} from '@remotion/media-parser';
import {expect, test} from 'bun:test';
import {
	createTkhdForAudio,
	createTkhdForVideo,
	TKHD_FLAGS,
} from '../create/iso-base-media/trak/create-tkhd';

const buffer = Uint8Array.from([
	// size, 32 bit
	0, 0, 0, 92,
	// mvhd atom, 32 bit
	116, 107, 104, 100,
	// version, 8 unsigned bit
	0,
	// flags, 24 bit
	0, 0, 15,
	// creation time, 32 bit
	226, 94, 106, 178,
	// modification time, 32 bit
	226, 94, 106, 182,
	// track id, 32 bit
	0, 0, 0, 5,
	// reserved, 32 bit
	0, 0, 0, 0,
	// duration, 32 bit
	0, 0, 7, 248,
	// reserved, 32 bit
	0, 0, 0, 0,
	// reserved, 32 bit
	0, 0, 0, 0,
	// layer, 16 bit
	0, 0,
	// alternate group, 16 bit
	0, 0,
	// volume, 16 bit
	0, 0,
	// reserved, 16 bit
	0, 0,
	// matrix[0], 32 bit
	0, 1, 0, 0,
	// matrix[1], 32 bit
	0, 0, 0, 0,
	// matrix[2], 32 bit
	0, 0, 0, 0,
	// matrix[3], 32 bit
	0, 0, 0, 0,
	// matrix[4], 32 bit
	0, 1, 0, 0,
	// matrix[5], 32 bit
	0, 0, 0, 0,
	// matrix[6], 32 bit
	0, 0, 0, 0,
	// matrix[7], 32 bit
	0, 0, 0, 0,
	// matrix[8], 32 bit
	64, 0, 0, 0,
	// width, 32 bit
	0, 0, 0, 0,
	// height, 32 bit
	0, 0, 0, 0,
]);

test('Should be able to parse a TKHD box', () => {
	const iterator = MediaParserInternals.getArrayBufferIterator(buffer, null);
	iterator.discard(8);
	const mvhd = MediaParserInternals.parseTkhd({
		iterator,
		offset: 0,
		size: 92,
	});
	expect(mvhd).toEqual({
		type: 'tkhd-box',
		boxSize: 92,
		offset: 0,
		alternateGroup: 0,
		creationTime: 1714993714000,
		duration: 2040,
		modificationTime: 1714993718000,
		trackId: 5,
		version: 0,
		layer: 0,
		volume: 0,
		matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
		width: 0,
		height: 0,
		rotation: 0,
		unrotatedWidth: 0,
		unrotatedHeight: 0,
	});
});

test('Should be able to create a tkhd', () => {
	expect(
		createTkhdForVideo({
			creationTime: 1714993714000,
			modificationTime: 1714993718000,
			trackId: 5,
			duration: 2040,
			volume: 0,
			matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
			width: 0,
			height: 0,
			flags:
				TKHD_FLAGS.TRACK_ENABLED |
				TKHD_FLAGS.TRACK_IN_MOVIE |
				TKHD_FLAGS.TRACK_IN_PREVIEW |
				TKHD_FLAGS.TRACK_IN_POSTER,
			timescale: 1000,
		}),
	).toEqual(buffer);
});

const buffer2 = new Uint8Array([
	0x00, 0x00, 0x00, 0x5c, 0x74, 0x6b, 0x68, 0x64, 0x00, 0x00, 0x00, 0x03, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x40, 0x00, 0x00, 0x00, 0x04, 0x38, 0x00, 0x00, 0x07, 0x80, 0x00,
	0x00,
]);

test('Should be able to parse a TKHD box 2', () => {
	const iterator = MediaParserInternals.getArrayBufferIterator(buffer2, null);
	iterator.discard(8);
	const mvhd = MediaParserInternals.parseTkhd({
		iterator,
		offset: 0,
		size: 92,
	});
	expect(mvhd).toEqual({
		type: 'tkhd-box',
		boxSize: 92,
		offset: 0,
		alternateGroup: 0,
		creationTime: null,
		duration: 0,
		modificationTime: null,
		trackId: 1,
		version: 0,
		layer: 0,
		volume: 0,
		matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
		width: 1080,
		height: 1920,
		rotation: 0,
		unrotatedWidth: 1080,
		unrotatedHeight: 1920,
	});

	expect(
		createTkhdForVideo({
			creationTime: null,
			modificationTime: null,
			duration: 0,
			height: 1920,
			width: 1080,
			matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
			trackId: 1,
			volume: 0,
			flags: TKHD_FLAGS.TRACK_ENABLED | TKHD_FLAGS.TRACK_IN_MOVIE,
			timescale: 1000,
		}),
	).toEqual(buffer2);
});

const audioTkhd = new Uint8Array([
	0x00, 0x00, 0x00, 0x5c, 0x74, 0x6b, 0x68, 0x64, 0x00, 0x00, 0x00, 0x03, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x0f, 0xd6, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x0,
]);

test('tkhd', () => {
	expect(
		createTkhdForAudio({
			creationTime: null,
			flags: 3,
			modificationTime: null,
			trackId: 2,
			duration: 4054,
			volume: 1,
			timescale: 1000,
		}),
	).toEqual(audioTkhd);
});
