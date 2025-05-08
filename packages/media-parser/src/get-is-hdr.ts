import type {MediaParserVideoTrack} from './get-tracks';
import {getHasTracks, getTracks} from './get-tracks';
import type {ParserState} from './state/parser-state';

const isVideoTrackHdr = (track: MediaParserVideoTrack) => {
	return (
		track.detailedColor.matrixCoefficients === 'bt2020-ncl' &&
		(track.detailedColor.transferCharacteristics === 'hlg' ||
			track.detailedColor.transferCharacteristics === 'pq') &&
		track.detailedColor.primaries === 'bt2020'
	);
};

export const getIsHdr = (state: ParserState): boolean => {
	const {videoTracks} = getTracks(state, true);

	return videoTracks.some((track) => isVideoTrackHdr(track));
};

export const hasHdr = (state: ParserState): boolean => {
	return getHasTracks(state, true);
};
