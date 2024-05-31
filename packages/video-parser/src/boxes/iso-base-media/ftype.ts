import type {BaseBox} from './base-type';

export interface FtypBox extends BaseBox {
	type: 'ftyp-box';
	majorBrand: string;
	minorVersion: number;
	compatibleBrands: string[];
}

export const fourByteToNumber = (data: ArrayBuffer, from: number) => {
	const view = new DataView(data);

	return (
		(view.getUint8(from + 0) << 24) |
		(view.getUint8(from + 1) << 16) |
		(view.getUint8(from + 2) << 8) |
		view.getUint8(from + 3)
	);
};

export const parseFtyp = (data: ArrayBuffer, offset: number): FtypBox => {
	const majorBrand = new TextDecoder().decode(data.slice(8, 12)).trim();

	const minorVersion = fourByteToNumber(data, 12);

	const rest = data.slice(16);
	const types = rest.byteLength / 4;
	const compatibleBrands: string[] = [];
	for (let i = 0; i < types; i++) {
		const fourBytes = rest.slice(i * 4, i * 4 + 4);
		compatibleBrands.push(new TextDecoder().decode(fourBytes).trim());
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
