import {getSamplesFromMoof} from '../../samples-from-moof';
import type {IsoBaseMediaBox} from './base-media-box';
import type {TfraBox} from './mfra/tfra';
import type {TkhdBox} from './tkhd';

export const collectSamplePositionsFromMoofBoxes = ({
	moofBoxes,
	tfraBoxes,
	tkhdBox,
}: {
	moofBoxes: IsoBaseMediaBox[];
	tfraBoxes: TfraBox[];
	tkhdBox: TkhdBox;
}) => {
	const isComplete =
		tfraBoxes.length > 0 &&
		tfraBoxes.every((t) => t.entries.length === moofBoxes.length);

	const samplePositions_ = moofBoxes.map((m) => {
		return getSamplesFromMoof({moofBox: m, trackId: tkhdBox.trackId});
	});

	return {samplePositions: samplePositions_, isComplete};
};
