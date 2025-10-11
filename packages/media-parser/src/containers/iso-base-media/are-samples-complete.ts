import type {MoofBox} from '../../state/iso-base-media/precomputed-moof';
import type {TfraBox} from './mfra/tfra';

export const areSamplesComplete = ({
	moofBoxes,
	tfraBoxes,
}: {
	moofBoxes: MoofBox[];
	tfraBoxes: TfraBox[];
}) => {
	if (moofBoxes.length === 0) {
		return true;
	}

	return (
		tfraBoxes.length > 0 &&
		tfraBoxes.every((t) => t.entries.length === moofBoxes.length)
	);
};
