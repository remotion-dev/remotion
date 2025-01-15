import type {VideoTrack} from './get-tracks';
import {getHasTracks, getTracks} from './get-tracks';
import type {Structure} from './parse-result';
import type {ParserState} from './state/parser-state';

const isVideoTrackHdr = (track: VideoTrack) => {
	return (
		track.color.matrixCoefficients === 'bt2020' &&
		track.color.transferCharacteristics === 'arib-std-b67' &&
		track.color.primaries === 'bt2020'
	);
};

export const getIsHdr = (boxes: Structure, state: ParserState): boolean => {
	const {videoTracks} = getTracks(boxes, state);

	return videoTracks.some((track) => isVideoTrackHdr(track));
};

export const hasHdr = (boxes: Structure, state: ParserState): boolean => {
	return getHasTracks(boxes, state);
};
