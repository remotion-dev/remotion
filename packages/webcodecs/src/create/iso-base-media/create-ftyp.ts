import {combineUint8Arrays} from '../matroska/matroska-utils';
import {
	addSize,
	numberTo32BitUIntOrInt,
	stringsToUint8Array,
} from './primitives';

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
	const minorBrandArr = numberTo32BitUIntOrInt(minorBrand);
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

export const createIsoBaseMediaFtyp = ({
	majorBrand,
	minorBrand,
	compatibleBrands,
}: {
	majorBrand: string;
	minorBrand: number;
	compatibleBrands: string[];
}) => {
	return createFtyp({compatibleBrands, majorBrand, minorBrand});
};
