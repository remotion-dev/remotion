import {expect, test} from 'bun:test';
import {createPasp} from '../create/iso-base-media/trak/mdia/minf/stbl/stsd/create-pasp';

const reference = new Uint8Array([
	0x00, 0x00, 0x00, 0x10, 0x70, 0x61, 0x73, 0x70, 0x00, 0x00, 0x00, 0x01, 0x00,
	0x00, 0x00, 0x01,
]);

test('pasp box', () => {
	const pasp = createPasp(1, 1);
	expect(pasp).toEqual(reference);
});
