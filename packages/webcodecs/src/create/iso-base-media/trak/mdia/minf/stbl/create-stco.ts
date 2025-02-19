import type {SamplePosition} from '@remotion/media-parser';
import {combineUint8Arrays} from '../../../../../matroska/matroska-utils';
import {
	addSize,
	numberTo32BitUIntOrInt,
	stringsToUint8Array,
} from '../../../../primitives';

export const createStcoAtom = (samplePositions: SamplePosition[]) => {
	const chunkOffsets = [];
	let lastChunk;
	for (const sample of samplePositions) {
		if (lastChunk !== sample.chunk) {
			chunkOffsets.push(sample.offset);
		}

		lastChunk = sample.chunk;
	}

	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('stco'),
			// version
			new Uint8Array([0]),
			// flags
			new Uint8Array([0, 0, 0]),
			// number of entries
			numberTo32BitUIntOrInt(chunkOffsets.length),
			// chunk offsets
			...chunkOffsets.map((offset) => numberTo32BitUIntOrInt(offset)),
		]),
	);
};
