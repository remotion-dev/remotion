import {getKeyframesFromIsoBaseMedia} from './boxes/iso-base-media/get-keyframes';
import {hasTracks} from './get-tracks';
import type {MediaParserKeyframe} from './options';
import type {Structure} from './parse-result';
import type {ParserState} from './state/parser-state';

export const getKeyframes = (
	structure: Structure,
): MediaParserKeyframe[] | null => {
	if (structure.type === 'iso-base-media') {
		return getKeyframesFromIsoBaseMedia(structure);
	}

	return null;
};

export const hasKeyframes = (
	structure: Structure,
	parserState: ParserState,
) => {
	if (structure.type === 'iso-base-media') {
		return hasTracks(structure, parserState);
	}

	// Has, but will be null
	return true;
};
