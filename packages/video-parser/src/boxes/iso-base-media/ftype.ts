import {getArrayBufferIterator} from '../../read-and-increment-offset';
import type {BaseBox} from './base-type';

export interface FtypBox extends BaseBox {
	type: 'ftyp-box';
	majorBrand: string;
	minorVersion: number;
	compatibleBrands: string[];
}

export const parseFtyp = (data: Uint8Array, offset: number): FtypBox => {
	const iterator = getArrayBufferIterator(data);
	iterator.discard(8);
	const majorBrand = iterator.getByteString(4);
	const minorVersion = iterator.getFourByteNumber();

	const rest = iterator.slice(16);
	const types = rest.byteLength / 4;
	const compatibleBrands: string[] = [];
	for (let i = 0; i < types; i++) {
		compatibleBrands.push(iterator.getByteString(4).trim());
	}

	return {
		type: 'ftyp-box',
		majorBrand,
		minorVersion,
		compatibleBrands,
		offset,
		boxSize: data.byteLength,
	};
};
