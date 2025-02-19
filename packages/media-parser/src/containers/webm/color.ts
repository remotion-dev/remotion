import type {VideoTrackColorParams} from '../../get-tracks';
import type {ColourSegment} from './segments/all-segments';
import {
	getMatrixCoefficientsSegment,
	getPrimariesSegment,
	getRangeSegment,
	getTransferCharacteristicsSegment,
} from './traversal';

export const parseColorSegment = (
	colourSegment: ColourSegment,
): VideoTrackColorParams => {
	const transferCharacteristics =
		getTransferCharacteristicsSegment(colourSegment);
	const matrixCoefficients = getMatrixCoefficientsSegment(colourSegment);
	const primaries = getPrimariesSegment(colourSegment);
	const range = getRangeSegment(colourSegment);

	return {
		transferCharacteristics: transferCharacteristics
			? transferCharacteristics.value.value === 1
				? 'bt709'
				: transferCharacteristics.value.value === 6
					? 'smpte170m'
					: transferCharacteristics.value.value === 13
						? 'iec61966-2-1'
						: null
			: null,
		matrixCoefficients: matrixCoefficients
			? matrixCoefficients.value.value === 1
				? 'bt709'
				: matrixCoefficients.value.value === 6
					? 'smpte170m'
					: matrixCoefficients.value.value === 5
						? 'bt470bg'
						: null
			: null,
		primaries: primaries
			? primaries.value.value === 1
				? 'bt709'
				: primaries.value.value === 6
					? 'smpte170m'
					: primaries.value.value === 5
						? 'bt470bg'
						: null
			: null,
		fullRange:
			transferCharacteristics?.value.value && matrixCoefficients?.value.value
				? null
				: range
					? Boolean(range?.value.value)
					: null,
	};
};
