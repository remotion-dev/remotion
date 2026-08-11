import {getCodecStringFromSpsAndPps} from './containers/avc/codec-string';
import {createSpsPpsData} from './containers/avc/create-sps-pps-data';
import type {MediaParserVideoTrack} from './get-tracks';
import type {SpsAndPps} from './state/parser-state';

export const addAvcProfileToTrack = (
	track: MediaParserVideoTrack,
	avc1Profile: SpsAndPps | null,
): MediaParserVideoTrack => {
	if (avc1Profile === null) {
		return track;
	}

	return {
		...track,
		codec: getCodecStringFromSpsAndPps(avc1Profile.sps),
		codecData: {type: 'avc-sps-pps', data: createSpsPpsData(avc1Profile)},
		// description should be undefined, since this signals to WebCodecs that
		// the codec is in Annex B format, which is the case for AVI files
		// https://www.w3.org/TR/webcodecs-avc-codec-registration/#videodecoderconfig-description

		// ChatGPT 4.1: "Great question! The format of the H.264/AVC bitstream inside a ⁠.avi file is almost always in the "Annex B" format"
		// (description is probably already undefined at this point, just writing this to be explicit)

		description: undefined,
	};
};
