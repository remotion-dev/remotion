import type {CttsBox} from './containers/iso-base-media/stsd/ctts';
import type {StcoBox} from './containers/iso-base-media/stsd/stco';
import type {StscBox} from './containers/iso-base-media/stsd/stsc';
import type {StssBox} from './containers/iso-base-media/stsd/stss';
import type {StszBox} from './containers/iso-base-media/stsd/stsz';
import type {SttsBox} from './containers/iso-base-media/stsd/stts';

export type SamplePosition = {
	offset: number;
	size: number;
	isKeyframe: boolean;
	decodingTimestamp: number;
	timestamp: number;
	duration: number;
	chunk: number;
	bigEndian: boolean;
	chunkSize: number | null;
};

export const getSamplePositions = ({
	stcoBox,
	stszBox,
	stscBox,
	stssBox,
	sttsBox,
	cttsBox,
}: {
	stcoBox: StcoBox;
	stszBox: StszBox;
	stscBox: StscBox;
	stssBox: StssBox | null;
	sttsBox: SttsBox;
	cttsBox: CttsBox | null;
}) => {
	const sttsDeltas: number[] = [];
	for (const distribution of sttsBox.sampleDistribution) {
		for (let i = 0; i < distribution.sampleCount; i++) {
			sttsDeltas.push(distribution.sampleDelta);
		}
	}

	const cttsEntries: number[] = [];
	for (const entry of cttsBox?.entries ?? [
		{sampleCount: sttsDeltas.length, sampleOffset: 0},
	]) {
		for (let i = 0; i < entry.sampleCount; i++) {
			cttsEntries.push(entry.sampleOffset);
		}
	}

	let dts = 0;

	const chunks = stcoBox.entries;
	const samples: SamplePosition[] = [];

	let samplesPerChunk = 1;

	for (let i = 0; i < chunks.length; i++) {
		const hasEntry = stscBox.entries.get(i + 1);
		if (hasEntry !== undefined) {
			samplesPerChunk = hasEntry;
		}

		let offsetInThisChunk = 0;

		for (let j = 0; j < samplesPerChunk; j++) {
			const size =
				stszBox.countType === 'fixed'
					? stszBox.sampleSize
					: stszBox.entries[samples.length];

			const isKeyframe = stssBox
				? stssBox.sampleNumber.has(samples.length + 1)
				: true;

			const delta = sttsDeltas[samples.length];
			const ctsOffset = cttsEntries[samples.length];
			const cts = dts + ctsOffset;

			samples.push({
				offset: Number(chunks[i]) + offsetInThisChunk,
				size,
				isKeyframe,
				decodingTimestamp: dts,
				timestamp: cts,
				duration: delta,
				chunk: i,
				bigEndian: false,
				chunkSize: null,
			});
			dts += delta;
			offsetInThisChunk += size;
		}
	}

	return samples;
};
