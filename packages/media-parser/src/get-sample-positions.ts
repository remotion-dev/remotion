import type {StcoBox} from './boxes/iso-base-media/stsd/stco';
import type {StscBox} from './boxes/iso-base-media/stsd/stsc';
import type {StszBox} from './boxes/iso-base-media/stsd/stsz';

export type SamplePosition = {
	offset: number;
	size: number;
};

export const getSamplePositions = ({
	stcoBox,
	stszBox,
	stscBox,
}: {
	stcoBox: StcoBox;
	stszBox: StszBox;
	stscBox: StscBox;
}) => {
	const chunks = stcoBox.entries;
	const samples: SamplePosition[] = [];

	let samplesPerChunk = 1;

	for (let i = 0; i < chunks.length; i++) {
		const hasEntry = stscBox.entries.find(
			(entry) => entry.firstChunk === i + 1,
		);
		if (hasEntry) {
			samplesPerChunk = hasEntry.samplesPerChunk;
		}

		let offsetInThisChunk = 0;

		for (let j = 0; j < samplesPerChunk; j++) {
			const size =
				stszBox.countType === 'fixed'
					? stszBox.sampleSize
					: stszBox.entries[samples.length];

			samples.push({
				offset: chunks[i] + offsetInThisChunk,
				size,
			});
			offsetInThisChunk += size;
		}
	}

	return samples;
};
