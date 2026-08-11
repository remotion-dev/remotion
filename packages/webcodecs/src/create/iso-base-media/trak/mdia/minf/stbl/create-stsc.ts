import type {SamplePosition} from '@remotion/media-parser';
import {combineUint8Arrays} from '../../../../../matroska/matroska-utils';
import {
	addSize,
	numberTo32BitUIntOrInt,
	stringsToUint8Array,
} from '../../../../primitives';

type Entry = {
	firstChunk: number;
	samplesPerChunk: number;
	sampleDescriptionIndex: number;
};

const createEntry = (entry: Entry) => {
	return combineUint8Arrays([
		numberTo32BitUIntOrInt(entry.firstChunk),
		numberTo32BitUIntOrInt(entry.samplesPerChunk),
		numberTo32BitUIntOrInt(entry.sampleDescriptionIndex),
	]);
};

export const createStsc = (samplePositions: SamplePosition[]) => {
	const entries: Entry[] = [];

	const deduplicateLastEntry = () => {
		const lastEntry = entries[entries.length - 1];
		const secondToLastEntry = entries[entries.length - 2];
		if (
			lastEntry &&
			secondToLastEntry &&
			lastEntry.samplesPerChunk === secondToLastEntry.samplesPerChunk &&
			lastEntry.sampleDescriptionIndex ===
				secondToLastEntry.sampleDescriptionIndex
		) {
			const lastIndex = entries.length - 1;
			entries.length = lastIndex;
		}
	};

	let lastChunk;
	for (const samplePosition of samplePositions) {
		if (samplePosition.chunk === lastChunk) {
			entries[entries.length - 1].samplesPerChunk++;
		} else {
			deduplicateLastEntry();
			entries.push({
				firstChunk: samplePosition.chunk,
				samplesPerChunk: 1,
				sampleDescriptionIndex: 1,
			});
			lastChunk = samplePosition.chunk;
		}
	}

	deduplicateLastEntry();

	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('stsc'),
			// version
			new Uint8Array([0]),
			// flags
			new Uint8Array([0, 0, 0]),
			// entry count
			numberTo32BitUIntOrInt(entries.length),
			// entries
			...entries.map((e) => createEntry(e)),
		]),
	);
};
