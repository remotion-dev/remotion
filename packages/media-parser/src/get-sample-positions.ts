import type {StcoBox} from './boxes/iso-base-media/stsd/stco';
import type {StscBox} from './boxes/iso-base-media/stsd/stsc';
import type {StssBox} from './boxes/iso-base-media/stsd/stss';
import type {StszBox} from './boxes/iso-base-media/stsd/stsz';
import type {SttsBox} from './boxes/iso-base-media/stts/stts';

export type SamplePosition = {
	offset: number;
	size: number;
	isKeyframe: boolean;
	dts: number;
	duration: number;
};

export const getSamplePositions = ({
	stcoBox,
	stszBox,
	stscBox,
	stssBox,
	sttsBox,
}: {
	stcoBox: StcoBox;
	stszBox: StszBox;
	stscBox: StscBox;
	stssBox: StssBox | null;
	sttsBox: SttsBox;
}) => {
	const deltas: number[] = [];
	for (const distribution of sttsBox.sampleDistribution) {
		for (let i = 0; i < distribution.sampleCount; i++) {
			deltas.push(distribution.sampleDelta);
		}
	}

	let dts = 0;

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

			const isKeyframe = stssBox
				? stssBox.sampleNumber.includes(samples.length + 1)
				: true;

			const delta = deltas[samples.length];

			samples.push({
				offset: chunks[i] + offsetInThisChunk,
				size,
				isKeyframe,
				dts,
				duration: delta,
			});
			dts += delta;
			offsetInThisChunk += size;
		}
	}

	return samples;
};
