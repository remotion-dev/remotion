import type {MediaParserVideoCodec} from '@remotion/media-parser';
import type {ConvertMediaContainer} from './get-available-containers';
import {normalizeVideoRotation} from './rotate-video-frame';

export const canCopyVideoTrack = ({
	inputCodec,
	container,
	inputRotation,
	rotationToApply,
}: {
	inputCodec: MediaParserVideoCodec;
	inputRotation: number;
	rotationToApply: number;
	container: ConvertMediaContainer;
}) => {
	if (
		normalizeVideoRotation(inputRotation) !==
		normalizeVideoRotation(rotationToApply)
	) {
		return false;
	}

	if (container === 'webm') {
		return inputCodec === 'vp8' || inputCodec === 'vp9';
	}

	if (container === 'mp4') {
		return inputCodec === 'h264';
	}

	if (container === 'wav') {
		return false;
	}

	throw new Error(`Unhandled codec: ${container satisfies never}`);
};
