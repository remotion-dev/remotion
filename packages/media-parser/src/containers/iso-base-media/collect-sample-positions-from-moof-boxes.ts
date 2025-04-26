import {getSamplesFromMoof} from '../../samples-from-moof';
import type {MoofBox} from '../../state/iso-base-media/precomputed-moof';
import type {TfraBox} from './mfra/tfra';
import type {GroupOfSamplePositions} from './sample-positions';
import type {TkhdBox} from './tkhd';

export const collectSamplePositionsFromMoofBoxes = ({
	moofBoxes,
	tfraBoxes,
	tkhdBox,
}: {
	moofBoxes: MoofBox[];
	tfraBoxes: TfraBox[];
	tkhdBox: TkhdBox;
}): {
	samplePositions: {
		isLastFragment: boolean;
		samples: GroupOfSamplePositions;
	}[];
	isComplete: boolean;
} => {
	const isComplete =
		tfraBoxes.length > 0 &&
		tfraBoxes.every((t) => t.entries.length === moofBoxes.length);

	const samplePositions = moofBoxes.map((m, index) => {
		const isLastFragment = index === moofBoxes.length - 1 && isComplete;

		return {
			isLastFragment,
			samples: {
				type: 'array' as const,
				boxes: getSamplesFromMoof({
					moofBox: m,
					trackId: tkhdBox.trackId,
				}),
			},
		};
	});

	return {samplePositions, isComplete};
};
