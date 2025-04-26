import type {MoofBox} from '../../state/iso-base-media/precomputed-moof';
import {collectSamplePositionsFromMoofBoxes} from './collect-sample-positions-from-moof-boxes';
import {collectSamplePositionsFromTrak} from './collect-sample-positions-from-trak';
import type {TfraBox} from './mfra/tfra';
import type {GroupOfSamplePositions} from './sample-positions';
import type {TrakBox} from './trak/trak';
import {getTkhdBox} from './traversal';

export const getSamplePositionsFromTrack = ({
	trakBox,
	moofBoxes,
	tfraBoxes,
}: {
	trakBox: TrakBox;
	moofBoxes: MoofBox[];
	tfraBoxes: TfraBox[];
}): {samplePositions: GroupOfSamplePositions[]; isComplete: boolean} => {
	const tkhdBox = getTkhdBox(trakBox);
	if (!tkhdBox) {
		throw new Error('Expected tkhd box in trak box');
	}

	if (moofBoxes.length > 0) {
		const {isComplete, samplePositions} = collectSamplePositionsFromMoofBoxes({
			moofBoxes,
			tfraBoxes,
			tkhdBox,
		});

		return {
			samplePositions: samplePositions.map((s) => s.samples),
			isComplete,
		};
	}

	return {
		samplePositions: [collectSamplePositionsFromTrak(trakBox)],
		isComplete: true,
	};
};
