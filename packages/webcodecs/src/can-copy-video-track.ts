import type {MediaParserContainer, VideoTrack} from '@remotion/media-parser';
import type {ConvertMediaContainer} from './get-available-containers';
import type {ResizeOperation} from './resizing/mode';
import {normalizeVideoRotation} from './rotate-and-resize-video-frame';
import {calculateNewDimensionsFromRotateAndScale} from './rotation';

export const canCopyVideoTrack = ({
	outputContainer,
	rotationToApply,
	inputContainer,
	resizeOperation,
	inputTrack,
}: {
	inputContainer: MediaParserContainer;
	inputTrack: VideoTrack;
	rotationToApply: number;
	outputContainer: ConvertMediaContainer;
	resizeOperation: ResizeOperation | null;
}) => {
	if (
		normalizeVideoRotation(inputTrack.rotation) !==
		normalizeVideoRotation(rotationToApply)
	) {
		return false;
	}

	const newDimensions = calculateNewDimensionsFromRotateAndScale({
		height: inputTrack.height,
		resizeOperation,
		rotation: rotationToApply,
		videoCodec: inputTrack.codecWithoutConfig,
		width: inputTrack.width,
	});
	if (
		newDimensions.height !== inputTrack.height ||
		newDimensions.width !== inputTrack.width
	) {
		return false;
	}

	if (outputContainer === 'webm') {
		return (
			inputTrack.codecWithoutConfig === 'vp8' ||
			inputTrack.codecWithoutConfig === 'vp9'
		);
	}

	if (outputContainer === 'mp4') {
		return (
			(inputTrack.codecWithoutConfig === 'h264' ||
				inputTrack.codecWithoutConfig === 'h265') &&
			(inputContainer === 'mp4' || inputContainer === 'avi')
		);
	}

	if (outputContainer === 'wav') {
		return false;
	}

	throw new Error(`Unhandled codec: ${outputContainer satisfies never}`);
};
