import type {VideoTrack} from './get-tracks';
import {getHasTracks, getTracks} from './get-tracks';
import type {ParserState} from './state/parser-state';

const isVideoTrackHdr = (track: VideoTrack) => {
	return (
		track.color.matrixCoefficients === 'bt2020' &&
		track.color.transferCharacteristics === 'arib-std-b67' &&
		track.color.primaries === 'bt2020'
	);
};

export const getIsHdr = (state: ParserState): boolean => {
	const {videoTracks} = getTracks(state);

	return videoTracks.some((track) => isVideoTrackHdr(track));
};

export const hasHdr = (state: ParserState): boolean => {
	return getHasTracks(state);
};
