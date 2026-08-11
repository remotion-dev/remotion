import {expect, test} from 'bun:test';
import {createMdhd} from '../create/iso-base-media/mdia/create-mdhd';

const reference = new Uint8Array([
	0, 0, 0, 32, 109, 100, 104, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 95,
	144, 1, 238, 98, 128, 85, 196, 0, 0,
]);

test('mdhd', () => {
	expect(reference.length).toBe(32);
	expect(
		createMdhd({
			creationTime: null,
			modificationTime: null,
			timescale: 90000,
			duration: 360000,
		}),
	).toEqual(reference);
});
