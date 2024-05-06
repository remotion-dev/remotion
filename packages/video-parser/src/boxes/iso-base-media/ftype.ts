import type {BaseBox} from './base-type';

export interface FtypBox extends BaseBox {
	type: 'ftyp-box';
	majorBrand: string;
	minorVersion: number;
	compatibleBrands: string[];
}

export const fourByteToNumber = (data: Buffer, from: number) => {
	return (
		(data[from + 0] << 24) |
		(data[from + 1] << 16) |
		(data[from + 2] << 8) |
		data[from + 3]
	);
};

export const parseFtyp = (data: Buffer, offset: number): FtypBox => {
	const majorBrand = data.subarray(8, 12).toString('utf-8').trim();

	const minorVersion = fourByteToNumber(data, 12);

	const rest = data.subarray(16);
	const types = rest.length / 4;
	const compatibleBrands: string[] = [];
	for (let i = 0; i < types; i++) {
		const fourBytes = rest.subarray(i * 4, i * 4 + 4);
		compatibleBrands.push(fourBytes.toString('utf-8').trim());
	}

	return {
		type: 'ftyp-box',
		majorBrand,
		minorVersion,
		compatibleBrands,
		offset,
		boxSize: data.length,
	};
};
