import type {SeekingInfo} from '../../seeking-info';
import type {ParserState} from '../../state/parser-state';
import {getMoofBoxes, getMoovBoxFromState, getTfraBoxes} from './traversal';

export const getSeekingInfoFromMp4 = (
	state: ParserState,
): SeekingInfo | null => {
	const structure = state.getIsoStructure();
	const moovAtom = getMoovBoxFromState(state);
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
		videoSections: state.videoSection.getVideoSections(),
	};
};
