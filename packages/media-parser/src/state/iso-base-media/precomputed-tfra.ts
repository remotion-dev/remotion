import type {TfraBox} from '../../containers/iso-base-media/mfra/tfra';

export const precomputedTfraState = () => {
	let tfraBoxes: TfraBox[] = [];

	return {
		getTfraBoxes: () => tfraBoxes,
		setTfraBoxes: (boxes: TfraBox[]) => {
			tfraBoxes = boxes;
		},
	};
};

export const deduplicateTfraBoxesByOffset = (tfraBoxes: TfraBox[]) => {
	return tfraBoxes.filter(
		(m, i, arr) => i === arr.findIndex((t) => t.offset === m.offset),
	);
};
