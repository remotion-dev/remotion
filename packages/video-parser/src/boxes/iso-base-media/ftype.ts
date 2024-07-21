import type {BufferIterator} from '../../read-and-increment-offset';
import type {BaseBox} from './base-type';

export interface FtypBox extends BaseBox {
	type: 'ftyp-box';
	majorBrand: string;
	minorVersion: number;
	compatibleBrands: string[];
}

export const parseFtyp = (iterator: BufferIterator): FtypBox => {
	const offset = iterator.counter.getOffset();
	iterator.discard(8);
	const majorBrand = iterator.getByteString(4);
	const minorVersion = iterator.getFourByteNumber();

	const rest = iterator.sliceFromHere(0);
	const types = rest.byteLength / 4;
	const compatibleBrands: string[] = [];
	for (let i = 0; i < types; i++) {
		compatibleBrands.push(iterator.getByteString(4).trim());
	}

	const offsetAtEnd = iterator.counter.getOffset();

	return {
		type: 'ftyp-box',
		majorBrand,
		minorVersion,
		compatibleBrands,
		offset,
		boxSize: offsetAtEnd - offset,
	};
};
