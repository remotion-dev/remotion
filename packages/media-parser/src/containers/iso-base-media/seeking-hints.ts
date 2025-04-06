import type {IsoBaseMediaStructure} from '../../parse-result';
import type {IsoBaseMediaSeekingHints} from '../../seeking-hints';
import type {IsoBaseMediaState} from '../../state/iso-base-media/iso-state';
import type {ParserState} from '../../state/parser-state';
import type {StructureState} from '../../state/structure';
import type {MediaSectionState} from '../../state/video-section';
import {getMoofBoxes, getMoovBoxFromState, getTfraBoxes} from './traversal';

export const getSeekingHintsFromMp4 = ({
	structureState,
	isoState,
	mp4HeaderSegment,
	mediaSectionState,
}: {
	structureState: StructureState;
	isoState: IsoBaseMediaState;
	mp4HeaderSegment: IsoBaseMediaStructure | null;
	mediaSectionState: MediaSectionState;
}): IsoBaseMediaSeekingHints | null => {
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
		type: 'iso-base-media-seeking-hints',
		moovBox: moovAtom,
		moofBoxes,
		tfraBoxes,
		mediaSections: mediaSectionState.getMediaSections(),
		mfraAlreadyLoaded: isoState.mfra.getIfAlreadyLoaded(),
	};
};

export const setSeekingHintsForMp4 = ({
	hints,
	state,
}: {
	hints: IsoBaseMediaSeekingHints;
	state: ParserState;
}) => {
	state.iso.moov.setMoovBox(hints.moovBox);
	state.iso.mfra.setFromSeekingHints(hints);
	for (const mediaSection of hints.mediaSections) {
		state.mediaSection.addMediaSection(mediaSection);
	}
};
