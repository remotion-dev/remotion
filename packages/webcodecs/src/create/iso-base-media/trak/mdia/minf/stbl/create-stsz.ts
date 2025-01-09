import type {SamplePosition} from '@remotion/media-parser';
import {combineUint8Arrays} from '../../../../../matroska/matroska-utils';
import {
	addSize,
	numberTo32BitUIntOrInt,
	stringsToUint8Array,
} from '../../../../primitives';

export const createStsz = (samplePositions: SamplePosition[]) => {
	const sampleSizes = samplePositions.map(
		(samplePosition) => samplePosition.size,
	);

	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('stsz'),
			// version
			new Uint8Array([0]),
			// flags
			new Uint8Array([0, 0, 0]),
			// sample size
			// Possible optimization for the future: If all sizes are the same, we don't have to list them all out
			// https://developer.apple.com/documentation/quicktime-file-format/sample_size_atom
			numberTo32BitUIntOrInt(0),
			// number of entries
			numberTo32BitUIntOrInt(sampleSizes.length),
			// sample sizes
			...sampleSizes.map((size) => numberTo32BitUIntOrInt(size)),
		]),
	);
};
