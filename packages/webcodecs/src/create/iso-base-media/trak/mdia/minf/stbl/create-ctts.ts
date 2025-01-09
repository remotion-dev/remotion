import type {SamplePosition} from '@remotion/media-parser';
import {combineUint8Arrays} from '../../../../../matroska/matroska-utils';
import {
	addSize,
	numberTo32BitUIntOrInt,
	stringsToUint8Array,
} from '../../../../primitives';

type Entry = {
	sampleCount: number;
	sampleOffset: number;
};

const makeEntry = (entry: Entry) => {
	return combineUint8Arrays([
		numberTo32BitUIntOrInt(entry.sampleCount),
		numberTo32BitUIntOrInt(entry.sampleOffset),
	]);
};

export const createCttsBox = (samplePositions: SamplePosition[]) => {
	const offsets = samplePositions.map((s) => s.cts - s.dts);
	const entries: Entry[] = [];

	let lastOffset: null | number = null;
	for (const offset of offsets) {
		if (lastOffset === offset) {
			entries[entries.length - 1].sampleCount++;
		} else {
			entries.push({
				sampleCount: 1,
				sampleOffset: offset,
			});
		}

		lastOffset = offset;
	}

	const needsCtts =
		entries.length > 0 && entries.some((e) => e.sampleOffset !== 0);

	if (!needsCtts) {
		return null;
	}

	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('ctts'),
			// version
			new Uint8Array([0]),
			// flags
			new Uint8Array([0, 0, 0]),
			// entry count
			numberTo32BitUIntOrInt(entries.length),
			// entries
			...entries.map((e) => makeEntry(e)),
		]),
	);
};
