import {expect, test} from 'bun:test';
import {getArrayBufferIterator} from '../buffer-iterator';
import {parseMvhd} from '../containers/iso-base-media/mvhd';

test('Should be able to parse a MVHD box correctly', () => {
	const buffer = Uint8Array.from([
		// size, 32 bit
		0, 0, 0, 108,
		// mvhd atom, 32 bit
		109, 118, 104, 100,
		// version, 8 unsigned bit
		0,
		// flags, 24 bit
		0, 0, 0,
		// creation time, 32 bit
		0, 0, 0, 0,
		// modification time, 32 bit
		0, 0, 0, 0,
		// time scale
		0, 0, 3, 232,
		// duration
		0, 0, 16, 71,
		// rate
		0, 1, 0, 0,
		// volume
		1, 0,
		// reserved 16 bit
		0, 0,
		// reserved 32 bit [0]
		0, 0, 0, 0,
		// reserved 32 bit [1]
		0, 0, 0, 0,
		// matrix [0]
		0, 1, 0, 0,
		// matrix [1]
		0, 0, 0, 0,
		// matrix [2]
		0, 0, 0, 0,
		// matrix [3]
		0, 0, 0, 0,
		// matrix [4]
		0, 1, 0, 0,
		// matrix [5]
		0, 0, 0, 0,
		// matrix [6]
		0, 0, 0, 0,
		// matrix [7]
		0, 0, 0, 0,
		// matrix [8]
		64, 0, 0, 0,
		// predefined [0]
		0, 0, 0, 0,
		// predefined [1]
		0, 0, 0, 0,
		// predefined [2]
		0, 0, 0, 0,
		// predefined [3]
		0, 0, 0, 0,
		// predefined [4]
		0, 0, 0, 0,
		// predefined [5]
		0, 0, 0, 0,
		// next track id
		0, 0, 0, 2,
	]);

	const iterator = getArrayBufferIterator(buffer, null);
	iterator.discard(8);

	const mvhd = parseMvhd({
		offset: 0,
		size: 108,
		iterator,
	});
	expect(mvhd).toEqual({
		creationTime: null,
		modificationTime: null,
		timeScale: 1000,
		durationInUnits: 4167,
		durationInSeconds: 4.167,
		rate: 1,
		volume: 1,
		// prettier-ignore
		matrix: [
			1, 0, 0,
			0, 1, 0,
			0, 0, 1
		],
		nextTrackId: 2,
		type: 'mvhd-box',
		boxSize: 108,
		offset: 0,
	});
});
