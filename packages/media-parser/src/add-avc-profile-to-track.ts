import {getCodecStringFromSpsAndPps} from './containers/avc/codec-string';
import {createSpsPpsData} from './containers/avc/create-sps-pps-data';
import type {VideoTrack} from './get-tracks';
import type {SpsAndPps} from './state/parser-state';

export const addAvcProfileToTrack = (
	track: VideoTrack,
	avc1Profile: SpsAndPps | null,
): VideoTrack => {
	if (avc1Profile === null) {
		return track;
	}

	return {
		...track,
		codec: getCodecStringFromSpsAndPps(avc1Profile.sps),
		codecPrivate: createSpsPpsData(avc1Profile),
	};
};
