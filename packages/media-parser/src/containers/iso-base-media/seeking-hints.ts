import type {IsoBaseMediaStructure} from '../../parse-result';
import type {IsoBaseMediaSeekingHints} from '../../seeking-hints';
import type {IsoBaseMediaState} from '../../state/iso-base-media/iso-state';
import {deduplicateMoofBoxesByOffset} from '../../state/iso-base-media/precomputed-moof';
import {deduplicateTfraBoxesByOffset} from '../../state/iso-base-media/precomputed-tfra';
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
		mayUsePrecomputed: true,
	});

	const moofBoxes = deduplicateMoofBoxesByOffset([
		...isoState.moof.getMoofBoxes(),
		...getMoofBoxes(structure.boxes),
	]);
	const tfraBoxes = deduplicateTfraBoxesByOffset([
		...isoState.tfra.getTfraBoxes(),
		...getTfraBoxes(structure.boxes),
	]);

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

// eslint-disable-next-line no-empty-pattern
export const setSeekingHintsForMp4 = ({}: {
	hints: IsoBaseMediaSeekingHints;
	state: ParserState;
}) => {
	// state.iso.moov.setMoovBox({
	//	moovBox: hints.moovBox,
	//	precomputed: true,
	// });
	// 	state.iso.mfra.setFromSeekingHints(hints);
	// state.iso.moof.setMoofBoxes(hints.moofBoxes);
	// TODO: Make use of these seeking hints and make tests pass
	/*
	//	state.iso.tfra.setTfraBoxes(hints.tfraBoxes);

	for (const mediaSection of hints.mediaSections) {
		// state.mediaSection.addMediaSection(mediaSection);
	}
	*/
};
