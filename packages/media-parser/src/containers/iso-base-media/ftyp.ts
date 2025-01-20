import type {BufferIterator} from '../../buffer-iterator';
import type {BaseBox} from './base-type';

export interface FtypBox extends BaseBox {
	type: 'ftyp-box';
	majorBrand: string;
	minorVersion: number;
	compatibleBrands: string[];
}

export const parseFtyp = ({
	iterator,
	size,
	offset,
}: {
	iterator: BufferIterator;
	size: number;
	offset: number;
}): FtypBox => {
	const majorBrand = iterator.getByteString(4, false);
	const minorVersion = iterator.getFourByteNumber();

	const types = (size - iterator.counter.getOffset()) / 4;
	const compatibleBrands: string[] = [];
	for (let i = 0; i < types; i++) {
		compatibleBrands.push(iterator.getByteString(4, false).trim());
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
