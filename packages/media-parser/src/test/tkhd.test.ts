import {expect, test} from 'bun:test';
import {parseTkhd} from '../boxes/iso-base-media/tkhd';
import {getArrayBufferIterator} from '../buffer-iterator';

test('Should be able to parse a TKHD box', () => {
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

	const iterator = getArrayBufferIterator(buffer);
	iterator.discard(8);
	const mvhd = parseTkhd({
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
