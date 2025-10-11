// If an audio is of type, LPCM, the data structure will include 44100-48000 samples per second
// We need to handle this case differently and treat each chunk as a sample instead

import type {TrakBox} from './containers/iso-base-media/trak/trak';
import {
	getStcoBox,
	getStscBox,
	getStszBox,
} from './containers/iso-base-media/traversal';
import type {SamplePosition} from './get-sample-positions';

// example video: mehmet.mov

export const getGroupedSamplesPositionsFromMp4 = ({
	trakBox,
	bigEndian,
}: {
	trakBox: TrakBox;
	bigEndian: boolean;
}): SamplePosition[] => {
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

	const stscKeys = Array.from(stscBox.entries.keys());
	for (let i = 0; i < stcoBox.entries.length; i++) {
		const entry = stcoBox.entries[i];
		const chunk = i + 1;
		const stscEntry = stscKeys.findLast((e) => e <= chunk);
		if (stscEntry === undefined) {
			throw new Error('should not be');
		}

		const samplesPerChunk = stscBox.entries.get(stscEntry);
		if (samplesPerChunk === undefined) {
			throw new Error('should not be');
		}

		samples.push({
			chunk,
			timestamp,
			decodingTimestamp: timestamp,
			offset: Number(entry),
			size: stszBox.sampleSize * samplesPerChunk,
			duration: samplesPerChunk,
			isKeyframe: true,
			bigEndian,
			chunkSize: stszBox.sampleSize,
		});
		timestamp += samplesPerChunk;
	}

	return samples;
};
