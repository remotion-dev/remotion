import {MediaParserInternals} from '@remotion/media-parser';
import {expect, test} from 'bun:test';
import {createMvhd} from '../create/iso-base-media/create-mvhd';
import {IDENTITY_MATRIX} from '../create/iso-base-media/primitives';

const input = new Uint8Array([
	// size
	0x00, 0x00, 0x00, 0x6c,
	// mvhd
	0x6d, 0x76, 0x68, 0x64,
	// version
	0x00,
	// flags
	0x00, 0x00, 0x00,
	// creation time
	0x00, 0x00, 0x00, 0x00,
	// modification time
	0x00, 0x00, 0x00, 0x00,
	// timescale
	0x00, 0x00, 0x03, 0xe8,
	// duration in units
	0x00, 0x00, 0x00, 0x00,
	// rate
	0x00, 0x01, 0x00, 0x00,
	// volume
	0x01, 0x00,
	// reserved
	0x00, 0x00,
	// reserved
	0x00, 0x00, 0x00, 0x00,
	// reserved
	0x00, 0x00, 0x00, 0x00,
	// matrix[0]
	0x00, 0x01, 0x00, 0x00,
	// matrix[1]
	0x00, 0x00, 0x00, 0x00,
	// matrix[2]
	0x00, 0x00, 0x00, 0x00,
	// matrix[3]
	0x00, 0x00, 0x00, 0x00,
	// matrix[4]
	0x00, 0x01, 0x00, 0x00,
	// matrix[5]
	0x00, 0x00, 0x00, 0x00,
	// matrix[6]
	0x00, 0x00, 0x00, 0x00,
	// matrix[7]
	0x00, 0x00, 0x00, 0x00,
	// matrix[8]
	0x40, 0x00, 0x00, 0x00,
	// predefined[0]
	0x00, 0x00, 0x00, 0x00,
	// predefined[1]
	0x00, 0x00, 0x00, 0x00,
	// predefined[2]
	0x00, 0x00, 0x00, 0x00,
	// predefined[3]
	0x00, 0x00, 0x00, 0x00,
	// predefined[4]
	0x00, 0x00, 0x00, 0x00,
	// predefined[5]
	0x00, 0x00, 0x00, 0x00,
	// next track id
	0x00, 0x00, 0x00, 0x02,
]);

test('Create mvhd box', () => {
	const iterator = MediaParserInternals.getArrayBufferIterator(input, null);
	const size = iterator.getFourByteNumber();
	iterator.discard(4);

	const parsed = MediaParserInternals.parseMvhd({
		iterator,
		offset: 0,
		size,
	});

	expect(parsed).toEqual({
		creationTime: null,
		modificationTime: null,
		timeScale: 1000,
		durationInUnits: 0,
		durationInSeconds: 0,
		rate: 1,
		volume: 1,
		matrix: IDENTITY_MATRIX,
		nextTrackId: 2,
		type: 'mvhd-box',
		boxSize: 108,
		offset: 0,
	});

	const content = createMvhd({
		timescale: 1000,
		durationInUnits: 0,
		rate: 1,
		volume: 1,
		nextTrackId: 2,
		matrix: [
			//
			1, 0, 0,
			//
			0, 1, 0,
			//
			0, 0, 1,
		],
		creationTime: null,
		modificationTime: null,
	});

	expect(content).toEqual(input);
});
