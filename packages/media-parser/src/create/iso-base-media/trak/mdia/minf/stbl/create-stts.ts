import {combineUint8Arrays} from '../../../../../../boxes/webm/make-header';
import type {SamplePosition} from '../../../../../../get-sample-positions';
import {truthy} from '../../../../../../truthy';
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

export const createSttsAtom = (samplePositions: SamplePosition[]) => {
	let lastDuration: null | number = null;
	const durations = samplePositions
		.map((_, i, a) => {
			if (a[i].duration === undefined) {
				return (a[i + 1]?.dts ?? a[i].dts) - a[i].dts;
			}

			return a[i].duration;
		})
		.filter(truthy);

	const entries: Entry[] = [];

	for (const duration of durations) {
		if (duration === lastDuration) {
			entries[entries.length - 1].sampleCount++;
		} else {
			entries.push({
				sampleCount: 1,
				sampleOffset: duration,
			});
		}

		lastDuration = duration;
	}

	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('stts'),
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
