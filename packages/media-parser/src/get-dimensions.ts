import {getTracks} from './get-tracks';
import {isAudioStructure} from './is-audio-structure';
import type {ParserState} from './state/parser-state';

export type Dimensions = {
	width: number;
	height: number;
};

export type ExpandedDimensions = Dimensions & {
	rotation: number;
	unrotatedWidth: number;
	unrotatedHeight: number;
};

export const getDimensions = (
	state: ParserState,
): ExpandedDimensions | null => {
	const structure = state.getStructureOrNull();
	if (structure && isAudioStructure(structure)) {
		return null;
	}

	const {videoTracks} = getTracks(state);
	if (!videoTracks.length) {
		return null;
	}

	const firstVideoTrack = videoTracks[0];

	return {
		width: firstVideoTrack.width,
		height: firstVideoTrack.height,
		rotation: firstVideoTrack.rotation,
		unrotatedHeight: firstVideoTrack.displayAspectHeight,
		unrotatedWidth: firstVideoTrack.displayAspectWidth,
	};
};

export const hasDimensions = (state: ParserState): boolean => {
	const structure = state.getStructureOrNull();
	if (structure && isAudioStructure(structure)) {
		return true;
	}

	try {
		return getDimensions(state) !== null;
	} catch {
		return false;
	}
};
