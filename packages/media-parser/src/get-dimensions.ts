import {getTracks} from './get-tracks';
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

// TODO: An audio track should return 'hasDimensions' = true on an audio file
// and stop parsing
export const hasDimensions = (state: ParserState): boolean => {
	try {
		return getDimensions(state) !== null;
	} catch {
		return false;
	}
};
