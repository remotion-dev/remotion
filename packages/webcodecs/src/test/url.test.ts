import {expect, test} from 'bun:test';
import {createUrlAtom} from '../create/iso-base-media/create-url';

const reference = new Uint8Array([
	0x00, 0x00, 0x00, 0x0c, 0x75, 0x72, 0x6c, 0x20, 0x00, 0x00, 0x00, 0x01,
]);

test('url atom', () => {
	const atom = createUrlAtom();
	expect(atom).toEqual(reference);
});
