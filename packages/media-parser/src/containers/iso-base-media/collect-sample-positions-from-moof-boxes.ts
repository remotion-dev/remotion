import {getSamplesFromMoof} from '../../samples-from-moof';
import type {MoofBox} from '../../state/iso-base-media/precomputed-moof';
import type {TfraBox} from './mfra/tfra';
import type {TkhdBox} from './tkhd';

export const collectSamplePositionsFromMoofBoxes = ({
	moofBoxes,
	tfraBoxes,
	tkhdBox,
}: {
	moofBoxes: MoofBox[];
	tfraBoxes: TfraBox[];
	tkhdBox: TkhdBox;
}) => {
	// In a fragmented MP4, the tfra boxes are present, then the number of tfra and moof boxes must be the same

	// In a m3u8, there are no tfra, and only 1 moof
	const isComplete =
		tfraBoxes.length === 0 ||
		(tfraBoxes.length > 0 &&
			tfraBoxes.every((t) => t.entries.length === moofBoxes.length));

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
