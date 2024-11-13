import {expect, test} from 'bun:test';
import {createColr} from '../create/iso-base-media/create-colr';

const reference = new Uint8Array([
	0x00, 0x00, 0x00, 0x13, 0x63, 0x6f, 0x6c, 0x72, 0x6e, 0x63, 0x6c, 0x78, 0x00,
	0x01, 0x00, 0x01, 0x00, 0x01, 0x0,
]);

test('colr', () => {
	expect(
		createColr({
			fullRange: false,
			matrixIndex: 1,
			primaries: 1,
			transferFunction: 1,
		}),
	).toEqual(reference);
});
