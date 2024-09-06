import type {VideoTrackColorParams} from '../../get-tracks';
import {makeMatroskaBytes} from './make-header';
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

export const makeMatroskaColorBytes = ({
	transferCharacteristics,
	matrixCoefficients,
	primaries,
	fullRange,
}: VideoTrackColorParams) => {
	const rangeValue =
		transferCharacteristics && matrixCoefficients
			? 3
			: fullRange === true
				? 2
				: fullRange === false
					? 1
					: 0;

	// https://datatracker.ietf.org/doc/draft-ietf-cellar-matroska/
	// 5.1.4.1.28.27
	const primariesValue =
		primaries === 'bt709'
			? 1
			: primaries === 'smpte170m'
				? 6
				: primaries === 'bt470bg'
					? 5
					: 2;

	const transferChracteristicsValue =
		transferCharacteristics === 'bt709'
			? 1
			: transferCharacteristics === 'smpte170m'
				? 6
				: transferCharacteristics === 'iec61966-2-1'
					? 13
					: 2;

	if (matrixCoefficients === 'rgb') {
		throw new Error('Cannot encode Matroska in RGB');
	}

	const matrixCoefficientsValue =
		matrixCoefficients === 'bt709'
			? 1
			: matrixCoefficients === 'bt470bg'
				? 5
				: matrixCoefficients === 'smpte170m'
					? 6
					: 2;

	return makeMatroskaBytes({
		type: 'Colour',
		minVintWidth: null,
		value: [
			{
				type: 'TransferCharacteristics',
				value: {
					value: transferChracteristicsValue,
					byteLength: null,
				},
				minVintWidth: null,
			},
			{
				type: 'MatrixCoefficients',
				value: {
					value: matrixCoefficientsValue,
					byteLength: null,
				},
				minVintWidth: null,
			},
			{
				type: 'Primaries',
				value: {
					value: primariesValue,
					byteLength: null,
				},
				minVintWidth: null,
			},
			{
				type: 'Range',
				value: {
					value: rangeValue,
					byteLength: null,
				},
				minVintWidth: null,
			},
		],
	});
};
