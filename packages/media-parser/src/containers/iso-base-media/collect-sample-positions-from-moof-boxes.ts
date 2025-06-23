import {getSamplesFromMoof} from '../../samples-from-moof';
import type {MoofBox} from '../../state/iso-base-media/precomputed-moof';
import type {TrexBox} from './moov/trex';
import type {TkhdBox} from './tkhd';

export const collectSamplePositionsFromMoofBoxes = ({
	moofBoxes,
	tkhdBox,
	isComplete,
	trexBoxes,
}: {
	moofBoxes: MoofBox[];
	tkhdBox: TkhdBox;
	isComplete: boolean;
	trexBoxes: TrexBox[];
}) => {
	const samplePositions = moofBoxes.map((m, index) => {
		const isLastFragment = index === moofBoxes.length - 1 && isComplete;

		return {
			isLastFragment,
			samples: getSamplesFromMoof({
				moofBox: m,
				trackId: tkhdBox.trackId,
				trexBoxes,
			}),
		};
	});

	return {samplePositions, isComplete};
};
