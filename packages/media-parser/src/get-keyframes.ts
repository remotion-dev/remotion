import {getKeyframesFromIsoBaseMedia} from './containers/iso-base-media/get-keyframes';
import {getHasTracks} from './get-tracks';
import type {MediaParserKeyframe} from './options';
import type {ParserState} from './state/parser-state';

export const getKeyframes = (
	state: ParserState,
): MediaParserKeyframe[] | null => {
	const structure = state.structure.getStructure();

	if (structure.type === 'iso-base-media') {
		return getKeyframesFromIsoBaseMedia(state);
	}

	return null;
};

export const hasKeyframes = (parserState: ParserState) => {
	const structure = parserState.structure.getStructure();
	if (structure.type === 'iso-base-media') {
		return getHasTracks(parserState, true);
	}

	// Has, but will be null
	return true;
};
