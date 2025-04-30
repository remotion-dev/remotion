import type {SamplePosition} from '../../get-sample-positions';
import type {MoofBox} from '../../state/iso-base-media/precomputed-moof';
import {collectSamplePositionsFromMoofBoxes} from './collect-sample-positions-from-moof-boxes';
import {collectSamplePositionsFromTrak} from './collect-sample-positions-from-trak';
import type {TrakBox} from './trak/trak';
import {getTkhdBox} from './traversal';

export const getSamplePositionsFromTrack = ({
	trakBox,
	moofBoxes,
	moofComplete,
}: {
	trakBox: TrakBox;
	moofBoxes: MoofBox[];
	moofComplete: boolean;
}): {samplePositions: SamplePosition[]; isComplete: boolean} => {
	const tkhdBox = getTkhdBox(trakBox);
	if (!tkhdBox) {
		throw new Error('Expected tkhd box in trak box');
	}

	if (moofBoxes.length > 0) {
		const {samplePositions} = collectSamplePositionsFromMoofBoxes({
			moofBoxes,
			tkhdBox,
			isComplete: moofComplete,
		});

		return {
			samplePositions: samplePositions.map((s) => s.samples).flat(1),
			isComplete: moofComplete,
		};
	}

	return {
		samplePositions: collectSamplePositionsFromTrak(trakBox),
		isComplete: true,
	};
};
