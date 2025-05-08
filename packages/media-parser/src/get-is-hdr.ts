import type {MediaParserVideoTrack} from './get-tracks';
import {getHasTracks, getTracks} from './get-tracks';
import type {ParserState} from './state/parser-state';

const isVideoTrackHdr = (track: MediaParserVideoTrack) => {
	return (
		track.advancedColor.matrix === 'bt2020-ncl' &&
		(track.advancedColor.transfer === 'hlg' ||
			track.advancedColor.transfer === 'pq') &&
		track.advancedColor.primaries === 'bt2020'
	);
};

export const getIsHdr = (state: ParserState): boolean => {
	const {videoTracks} = getTracks(state, true);

	return videoTracks.some((track) => isVideoTrackHdr(track));
};

export const hasHdr = (state: ParserState): boolean => {
	return getHasTracks(state, true);
};
