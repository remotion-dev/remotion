import {combineUint8Arrays} from '../../boxes/webm/make-header';

const stringsToUint8Array = (str: string) => {
	return new TextEncoder().encode(str);
};

const numberToUint8Array = (num: number) => {
	return new Uint8Array([
		(num >> 24) & 0xff,
		(num >> 16) & 0xff,
		(num >> 8) & 0xff,
		num & 0xff,
	]);
};

export const addSize = (arr: Uint8Array) => {
	return combineUint8Arrays([numberToUint8Array(arr.length + 4), arr]);
};

export const createFtyp = ({
	majorBrand,
	minorBrand,
	compatibleBrands,
}: {
	majorBrand: string;
	minorBrand: number;
	compatibleBrands: string[];
}) => {
	const type = stringsToUint8Array('ftyp');
	const majorBrandArr = stringsToUint8Array(majorBrand);
	const minorBrandArr = numberToUint8Array(minorBrand);
	const compatibleBrandsArr = combineUint8Arrays(
		compatibleBrands.map((b) => stringsToUint8Array(b)),
	);

	return addSize(
		combineUint8Arrays([
			type,
			majorBrandArr,
			minorBrandArr,
			compatibleBrandsArr,
		]),
	);
};

export const createIsoBaseMediaFtyp = () => {
	return createFtyp({
		majorBrand: 'iso5',
		minorBrand: 512,
		compatibleBrands: ['iso5', 'iso6', 'mp41'],
	});
};
