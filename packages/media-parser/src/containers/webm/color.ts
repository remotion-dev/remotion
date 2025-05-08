import type {MediaParserDetailedColor} from '../../get-tracks';
import {
	getMatrixCoefficientsFromIndex,
	getPrimariesFromIndex,
	getTransferCharacteristicsFromIndex,
} from '../avc/color';
import type {ColourSegment} from './segments/all-segments';
import {
	getMatrixCoefficientsSegment,
	getPrimariesSegment,
	getRangeSegment,
	getTransferCharacteristicsSegment,
} from './traversal';

export const parseColorSegment = (
	colourSegment: ColourSegment,
): MediaParserDetailedColor => {
	const transferCharacteristics =
		getTransferCharacteristicsSegment(colourSegment);
	const matrixCoefficients = getMatrixCoefficientsSegment(colourSegment);
	const primaries = getPrimariesSegment(colourSegment);
	const range = getRangeSegment(colourSegment);

	return {
		transferCharacteristics: transferCharacteristics
			? getTransferCharacteristicsFromIndex(transferCharacteristics.value.value)
			: null,
		matrixCoefficients: matrixCoefficients
			? getMatrixCoefficientsFromIndex(matrixCoefficients.value.value)
			: null,
		primaries: primaries ? getPrimariesFromIndex(primaries.value.value) : null,
		fullRange:
			transferCharacteristics?.value.value && matrixCoefficients?.value.value
				? null
				: range
					? Boolean(range?.value.value)
					: null,
	};
};
