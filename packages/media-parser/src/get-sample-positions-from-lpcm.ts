// If an audio is of type, LPCM, the data structure will include 44100-48000 samples per second
// We need to handle this case differently and treat each chunk as a sample instead

import type {TrakBox} from './boxes/iso-base-media/trak/trak';
import {
	getStcoBox,
	getStscBox,
	getStszBox,
} from './boxes/iso-base-media/traversal';
import type {SamplePosition} from './get-sample-positions';

// example video: mehmet.mov

export const getSamplePositionsFromLpcm = (
	trakBox: TrakBox,
): SamplePosition[] => {
	const stscBox = getStscBox(trakBox);
	const stszBox = getStszBox(trakBox);
	const stcoBox = getStcoBox(trakBox);

	if (!stscBox) {
		throw new Error('Expected stsc box in trak box');
	}

	if (!stcoBox) {
		throw new Error('Expected stco box in trak box');
	}

	if (!stszBox) {
		throw new Error('Expected stsz box in trak box');
	}

	if (stszBox.countType !== 'fixed') {
		throw new Error('Only supporting fixed count type in stsz box');
	}

	const samples: SamplePosition[] = [];

	let timestamp = 0;

	for (let i = 0; i < stscBox.entries.length; i++) {
		const entry = stscBox.entries[i];
		while (entry.firstChunk - 1 !== samples.length - 1) {
			const chunk = samples.length;
			samples.push({
				chunk,
				cts: timestamp,
				dts: timestamp,
				offset: Number(stcoBox.entries[chunk]),
				size: stszBox.sampleSize * entry.samplesPerChunk,
				duration: entry.samplesPerChunk,
				isKeyframe: true,
			});
			timestamp += entry.samplesPerChunk;
		}
	}

	return samples;
};
