import type {SamplePosition} from '../../get-sample-positions';
import type {GroupOfSamplePositions} from './sample-positions';
import type {CttsBox} from './stsd/ctts';
import type {StcoBox} from './stsd/stco';
import type {StscBox} from './stsd/stsc';
import type {StssBox} from './stsd/stss';
import type {StszBox} from './stsd/stsz';
import type {SttsBox} from './stsd/stts';

export const turnSamplePositionsIntoArraySlow = ({
	stcoBox,
	stszBox,
	stscBox,
	stssBox,
	sttsBox,
	cttsBox,
	onlyKeyframes,
}: {
	stcoBox: StcoBox;
	stszBox: StszBox;
	stscBox: StscBox;
	stssBox: StssBox | null;
	sttsBox: SttsBox;
	cttsBox: CttsBox | null;
	onlyKeyframes: boolean;
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

	const samples: SamplePosition[] = [];

	let samplesPerChunk = 1;

	for (let i = 0; i < stcoBox.entries.length; i++) {
		const hasEntry = stscBox.entries.find(
			(entry) => entry.firstChunk === i + 1,
		);
		if (hasEntry) {
			samplesPerChunk = hasEntry.samplesPerChunk;
		}

		let offsetInThisChunk = 0;

		for (let j = 0; j < samplesPerChunk; j++) {
			const isKeyframe = stssBox
				? stssBox.sampleNumber.includes(samples.length + 1)
				: true;
			if (onlyKeyframes && !isKeyframe) {
				continue;
			}

			const size =
				stszBox.countType === 'fixed'
					? stszBox.sampleSize
					: stszBox.entries[samples.length];

			const delta = sttsDeltas[samples.length];
			const ctsOffset = cttsEntries[samples.length];
			const cts = dts + ctsOffset;

			samples.push({
				offset: Number(stcoBox.entries[i]) + offsetInThisChunk,
				size,
				isKeyframe,
				dts,
				cts,
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

export const turnIntoOld = (
	samplePositions: GroupOfSamplePositions,
): SamplePosition[] => {
	if (samplePositions.type === 'map') {
		return turnSamplePositionsIntoArraySlow({
			...samplePositions.boxes,
			onlyKeyframes: false,
		});
	}

	return samplePositions.boxes;
};

export const turnGroupIntoOld = (
	samplePositions: GroupOfSamplePositions[],
): SamplePosition[] => {
	return samplePositions.map((s) => turnIntoOld(s)).flat();
};
