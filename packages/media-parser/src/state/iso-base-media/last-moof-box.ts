import type {IsoBaseMediaBox} from '../../containers/iso-base-media/base-media-box';
import type {TfraBox} from '../../containers/iso-base-media/mfra/tfra';
import {truthy} from '../../truthy';

export const getLastMoofBox = (boxes: IsoBaseMediaBox[]) => {
	if (boxes) {
		const tfras = boxes.filter((b) => b.type === 'tfra-box') as TfraBox[];
		const lastMoofOffsets = tfras.map((f) => {
			if (f.entries.length <= 1) {
				return null;
			}

			return f.entries[f.entries.length - 1].moofOffset;
		});

		if (lastMoofOffsets.length > 0) {
			const maxOffset = Math.max(...lastMoofOffsets.filter(truthy));

			return maxOffset;
		}

		return null;
	}
};

export const getMaxFirstMoofOffset = (boxes: IsoBaseMediaBox[]) => {
	const tfras = boxes.filter((b) => b.type === 'tfra-box') as TfraBox[];
	const firstMoofOffsets = tfras.map((f) => {
		return f.entries[0].moofOffset;
	});

	return Math.max(...firstMoofOffsets.filter(truthy));
};
