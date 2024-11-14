import {expect, test} from 'bun:test';
import {exampleAudioSamplePositions} from '../create/iso-base-media/example-stts';
import {createSttsAtom} from '../create/iso-base-media/trak/mdia/minf/stbl/create-stts';

const reference = new Uint8Array([
	0x00, 0x00, 0x00, 0x18, 0x73, 0x74, 0x74, 0x73, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0xbe, 0x00, 0x00, 0x04, 0x00,
]);

test('stts', () => {
	return expect(createSttsAtom(exampleAudioSamplePositions)).toEqual(reference);
});
