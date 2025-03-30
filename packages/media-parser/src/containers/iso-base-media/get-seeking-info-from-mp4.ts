import type {IsoBaseMediaStructure} from '../../parse-result';
import type {IsoBaseMediaSeekingInfo} from '../../seeking-info';
import type {IsoBaseMediaState} from '../../state/iso-base-media/iso-state';
import type {StructureState} from '../../state/structure';
import type {MediaSectionState} from '../../state/video-section';
import {getMoofBoxes, getMoovBoxFromState, getTfraBoxes} from './traversal';

export const getSeekingInfoFromMp4 = ({
	structureState,
	isoState,
	mp4HeaderSegment,
	mediaSectionState,
}: {
	structureState: StructureState;
	isoState: IsoBaseMediaState;
	mp4HeaderSegment: IsoBaseMediaStructure | null;
	mediaSectionState: MediaSectionState;
}): IsoBaseMediaSeekingInfo | null => {
	const structure = structureState.getIsoStructure();
	const moovAtom = getMoovBoxFromState({
		isoState,
		mp4HeaderSegment,
		structureState,
	});
	const moofBoxes = getMoofBoxes(structure.boxes);
	const tfraBoxes = getTfraBoxes(structure);

	if (!moovAtom) {
		return null;
	}

	return {
		type: 'iso-base-media-seeking-info',
		moovBox: moovAtom,
		moofBoxes,
		tfraBoxes,
		mediaSections: mediaSectionState.getMediaSections(),
	};
};
