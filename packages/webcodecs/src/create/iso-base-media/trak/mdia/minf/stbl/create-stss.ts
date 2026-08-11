import type {SamplePosition} from '@remotion/media-parser';
import {combineUint8Arrays} from '../../../../../matroska/matroska-utils';
import {
	addSize,
	numberTo32BitUIntOrInt,
	stringsToUint8Array,
} from '../../../../primitives';

export const createStss = (samplePositions: SamplePosition[]) => {
	const samples = samplePositions
		.map((sample, i) => [sample.isKeyframe, i] as const)
		.filter((s) => s[0])
		.map((s) => s[1] + 1);

	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('stss'),
			// version
			new Uint8Array([0]),
			// flags
			new Uint8Array([0, 0, 0]),
			// entry count
			numberTo32BitUIntOrInt(samples.length),
			...samples.map((sample) => numberTo32BitUIntOrInt(sample)),
		]),
	);
};
