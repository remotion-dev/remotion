import {getTracks} from './get-tracks';
import {isAudioStructure} from './is-audio-structure';
import type {ParserState} from './state/parser-state';

export type MediaParserDimensions = {
	width: number;
	height: number;
};

export type ExpandedDimensions = MediaParserDimensions & {
	rotation: number;
	unrotatedWidth: number;
	unrotatedHeight: number;
};

export const getDimensions = (
	state: ParserState,
): ExpandedDimensions | null => {
	const structure = state.structure.getStructureOrNull();
	if (structure && isAudioStructure(structure)) {
		return null;
	}

	const tracks = getTracks(state, true);
	if (!tracks.length) {
		return null;
	}

	const firstVideoTrack = tracks.find((t) => t.type === 'video');
	if (!firstVideoTrack) {
		return null;
	}

	return {
		width: firstVideoTrack.width,
		height: firstVideoTrack.height,
		rotation: firstVideoTrack.rotation,
		unrotatedHeight: firstVideoTrack.displayAspectHeight,
		unrotatedWidth: firstVideoTrack.displayAspectWidth,
	};
};

export const hasDimensions = (state: ParserState): boolean => {
	const structure = state.structure.getStructureOrNull();
	if (structure && isAudioStructure(structure)) {
		return true;
	}

	try {
		return getDimensions(state) !== null;
	} catch {
		return false;
	}
};
