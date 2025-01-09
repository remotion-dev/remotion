import {MediaParserInternals} from '@remotion/media-parser';
import {expect, test} from 'bun:test';
import {createIsoBaseMediaFtyp} from '../create/iso-base-media/create-ftyp';

const input = new Uint8Array([
	// size
	0x00, 0x00, 0x00, 0x1c,
	// ftyp
	0x66, 0x74, 0x79, 0x70,
	// iso5
	0x69, 0x73, 0x6f, 0x35,
	// 512
	0x00, 0x00, 0x02, 0x00,
	// iso5
	0x69, 0x73, 0x6f, 0x35,
	// iso6
	0x69, 0x73, 0x6f, 0x36,
	// mp41
	0x6d, 0x70, 0x34, 0x31,
]);

test('Create ftyp box', () => {
	const iterator = MediaParserInternals.getArrayBufferIterator(input, null);
	const size = iterator.getFourByteNumber();
	iterator.discard(4);

	const parsed = MediaParserInternals.parseFtyp({
		iterator,
		offset: 0,
		size,
	});

	expect(parsed).toEqual({
		boxSize: 28,
		compatibleBrands: ['iso5', 'iso6', 'mp41'],
		majorBrand: 'iso5',
		minorVersion: 512,
		offset: 0,
		type: 'ftyp-box',
	});
});

test('Should create ftyp box', () => {
	const ftype = createIsoBaseMediaFtyp({
		compatibleBrands: ['iso5', 'iso6', 'mp41'],
		majorBrand: 'iso5',
		minorBrand: 512,
	});
	expect(ftype).toEqual(input);
});
