import type {
	MediaParserVideoCodec,
	ParseMediaContainer,
} from '@remotion/media-parser';
import type {ConvertMediaContainer} from './get-available-containers';
import {normalizeVideoRotation} from './rotate-and-resize-video-frame';

export const canCopyVideoTrack = ({
	inputCodec,
	outputContainer,
	inputRotation,
	rotationToApply,
	inputContainer,
}: {
	inputContainer: ParseMediaContainer;
	inputCodec: MediaParserVideoCodec;
	inputRotation: number;
	rotationToApply: number;
	outputContainer: ConvertMediaContainer;
}) => {
	if (
		normalizeVideoRotation(inputRotation) !==
		normalizeVideoRotation(rotationToApply)
	) {
		return false;
	}

	if (outputContainer === 'webm') {
		return inputCodec === 'vp8' || inputCodec === 'vp9';
	}

	if (outputContainer === 'mp4') {
		return (
			inputCodec === 'h264' &&
			(inputContainer === 'mp4' || inputContainer === 'avi')
		);
	}

	if (outputContainer === 'wav') {
		return false;
	}

	throw new Error(`Unhandled codec: ${outputContainer satisfies never}`);
};
