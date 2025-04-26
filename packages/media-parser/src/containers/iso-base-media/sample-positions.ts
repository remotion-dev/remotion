import type {SamplePosition} from '../../get-sample-positions';
import type {CttsBox} from './stsd/ctts';
import type {StcoBox} from './stsd/stco';
import type {StscBox} from './stsd/stsc';
import type {StssBox} from './stsd/stss';
import type {StszBox} from './stsd/stsz';
import type {SttsBox} from './stsd/stts';
import {turnSamplePositionsIntoArraySlow} from './turn-sample-positions-into-array';

export type GroupOfSamplePositions =
	| {
			type: 'array';
			boxes: SamplePosition[];
	  }
	| {
			type: 'map';
			boxes: {
				stszBox: StszBox;
				stcoBox: StcoBox;
				stscBox: StscBox;
				sttsBox: SttsBox;
				stssBox: StssBox | null;
				cttsBox: CttsBox | null;
			};
	  };

export const hasNoSamplePositions = (
	samplePositions: GroupOfSamplePositions,
) => {
	if (samplePositions.type === 'array') {
		return samplePositions.boxes.length === 0;
	}

	return samplePositions.boxes.stcoBox.entryCount === 0;
};

export const hasNoSamplePositionsGroup = (
	samplePositions: GroupOfSamplePositions[],
) => {
	return samplePositions.every((s) => hasNoSamplePositions(s));
};

export const getKeyframesFromGroupOfSamplePositions = (
	samplePositions: GroupOfSamplePositions,
) => {
	if (samplePositions.type === 'array') {
		return samplePositions.boxes.filter((s) => s.isKeyframe);
	}

	if (!samplePositions.boxes.stssBox) {
		return turnSamplePositionsIntoArraySlow({
			...samplePositions.boxes,
			onlyKeyframes: true,
		});
	}

	return turnSamplePositionsIntoArraySlow({
		...samplePositions.boxes,
		onlyKeyframes: false,
	});
};

export const groupGetKeyframesFromGroupOfSamplePositions = (
	samplePositions: GroupOfSamplePositions[],
) => {
	return samplePositions
		.map((s) => getKeyframesFromGroupOfSamplePositions(s))
		.flat();
};
