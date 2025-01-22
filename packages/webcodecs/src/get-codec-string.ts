import {chooseCorrectAvc1Profile} from './choose-correct-avc1-profile';
import {chooseCorrectHevcProfile} from './choose-correct-hevc-profile';
import type {ConvertMediaVideoCodec} from './get-available-video-codecs';

export const getCodecStringForEncoder = ({
	codec,
	fps,
	height,
	width,
}: {
	codec: ConvertMediaVideoCodec;
	fps: number | null;
	height: number;
	width: number;
}) => {
	if (codec === 'h264') {
		return chooseCorrectAvc1Profile({fps, height, width});
	}

	if (codec === 'h265') {
		return chooseCorrectHevcProfile({fps, height, width});
	}

	if (codec === 'vp8') {
		return 'vp8';
	}

	if (codec === 'vp9') {
		return 'vp09.00.10.08';
	}

	throw new Error(`Unknown codec: ${codec satisfies never}`);
};
