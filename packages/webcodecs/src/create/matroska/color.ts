import type {PossibleEbml, VideoTrackColorParams} from '@remotion/media-parser';
import {truthy} from '../../truthy';
import {makeMatroskaBytes} from './matroska-utils';

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
		value: (
			[
				transferChracteristicsValue === 2
					? null
					: {
							type: 'TransferCharacteristics',
							value: {
								value: transferChracteristicsValue,
								byteLength: null,
							},
							minVintWidth: null,
						},
				matrixCoefficientsValue === 2
					? null
					: {
							type: 'MatrixCoefficients' as const,
							value: {
								value: matrixCoefficientsValue,
								byteLength: null,
							},
							minVintWidth: null,
						},
				primariesValue === 2
					? null
					: {
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
			] as PossibleEbml[]
		).filter(truthy),
	});
};
