import type {MediaParserInternalTypes} from '@remotion/media-parser';
import {combineUint8Arrays} from '../../../../../matroska/matroska-utils';
import {
	addSize,
	numberTo32BitUIntOrInt,
	numberTo64BitUIntOrInt,
	stringsToUint8Array,
} from '../../../../primitives';

export const createStcoAtom = (
	samplePositions: MediaParserInternalTypes['SamplePosition'][],
) => {
	const chunkOffsets = [];
	let lastChunk;
	let needs64Bit = false;

	for (const sample of samplePositions) {
		if (lastChunk !== sample.chunk) {
			chunkOffsets.push(sample.offset);
		}

		if (sample.offset > 2 ** 32) {
			needs64Bit = true;
		}

		lastChunk = sample.chunk;
	}

	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array(needs64Bit ? 'co64' : 'stco'),
			// version
			new Uint8Array([0]),
			// flags
			new Uint8Array([0, 0, 0]),
			// number of entries
			numberTo32BitUIntOrInt(chunkOffsets.length),
			// chunk offsets
			combineUint8Arrays(
				chunkOffsets.map((offset) =>
					needs64Bit
						? numberTo64BitUIntOrInt(offset)
						: numberTo32BitUIntOrInt(offset),
				),
			),
		]),
	);
};
