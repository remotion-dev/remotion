import type {SamplePosition} from '../../get-sample-positions';
import type {IsoBaseMediaBox} from './base-media-box';
import {collectSamplePositionsFromMoofBoxes} from './collect-sample-positions-from-moof-boxes';
import {collectSamplePositionsFromTrak} from './collect-sample-positions-from-trak';
import type {TfraBox} from './mfra/tfra';
import type {TrakBox} from './trak/trak';
import {getTkhdBox} from './traversal';

export const getSamplePositionsFromTrack = ({
	trakBox,
	moofBoxes,
	tfraBoxes,
}: {
	trakBox: TrakBox;
	moofBoxes: IsoBaseMediaBox[];
	tfraBoxes: TfraBox[];
}): {samplePositions: SamplePosition[]; isComplete: boolean} => {
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
			samplePositions,
			isComplete,
		};
	}

	return {
		samplePositions: collectSamplePositionsFromTrak(trakBox),
		isComplete: true,
	};
};
