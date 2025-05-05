import {getSamplesFromMoof} from '../../samples-from-moof';
import type {MoofBox} from '../../state/iso-base-media/precomputed-moof';
import type {TkhdBox} from './tkhd';

export const collectSamplePositionsFromMoofBoxes = ({
	moofBoxes,
	tkhdBox,
	isComplete,
}: {
	moofBoxes: MoofBox[];
	tkhdBox: TkhdBox;
	isComplete: boolean;
}) => {
	const samplePositions = moofBoxes.map((m, index) => {
		const isLastFragment = index === moofBoxes.length - 1 && isComplete;

		return {
			isLastFragment,
			samples: getSamplesFromMoof({
				moofBox: m,
				trackId: tkhdBox.trackId,
			}),
		};
	});

	return {samplePositions, isComplete};
};
