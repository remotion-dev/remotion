import {expect, test} from 'bun:test';
import {createIlst} from '../create/iso-base-media/create-ilst';
import {createCmt} from '../create/iso-base-media/ilst/create-cmt';
import {createToo} from '../create/iso-base-media/ilst/create-too';
import {createMeta} from '../create/iso-base-media/udta/create-meta';
import {createHdlr} from '../create/iso-base-media/udta/meta/create-hdlr';

test('meta atom', () => {
	expect(
		createMeta({
			hdlr: createHdlr('mdir'),
			ilst: createIlst([
				createToo('Lavf61.7.100'),
				createCmt('Made with Remotion 4.0.227'),
			]),
		}),
	).toEqual(
		new Uint8Array([
			0, 0, 0, 139, 109, 101, 116, 97, 0, 0, 0, 0, 0, 0, 0, 33, 104, 100, 108,
			114, 0, 0, 0, 0, 0, 0, 0, 0, 109, 100, 105, 114, 97, 112, 112, 108, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94, 105, 108, 115, 116, 0, 0, 0, 36, 169,
			116, 111, 111, 0, 0, 0, 28, 100, 97, 116, 97, 0, 0, 0, 1, 0, 0, 0, 0, 76,
			97, 118, 102, 54, 49, 46, 55, 46, 49, 48, 48, 0, 0, 0, 50, 169, 99, 109,
			116, 0, 0, 0, 42, 100, 97, 116, 97, 0, 0, 0, 1, 0, 0, 0, 0, 77, 97, 100,
			101, 32, 119, 105, 116, 104, 32, 82, 101, 109, 111, 116, 105, 111, 110,
			32, 52, 46, 48, 46, 50, 50, 55,
		]),
	);
});
