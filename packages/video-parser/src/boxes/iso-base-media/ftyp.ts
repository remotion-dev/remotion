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
	const size = iterator.getUint32();
	const atom = iterator.getAtom();
	if (atom !== 'ftyp') {
		throw new Error(`Expected ftyp atom, got ${atom}`);
	}

	const majorBrand = iterator.getByteString(4);
	const minorVersion = iterator.getFourByteNumber();

	const types = (size - iterator.counter.getOffset()) / 4;
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
