import type {
	MediaParserContainer,
	MediaParserVideoTrack,
} from '@remotion/media-parser';
import type {ConvertMediaContainer} from './get-available-containers';
import type {ConvertMediaVideoCodec} from './get-available-video-codecs';
import {isSameVideoCodec} from './is-different-video-codec';
import type {ResizeOperation} from './resizing/mode';
import {normalizeVideoRotation} from './rotate-and-resize-video-frame';
import {calculateNewDimensionsFromRotateAndScale} from './rotation';

export const canCopyVideoTrack = ({
	outputContainer,
	rotationToApply,
	inputContainer,
	resizeOperation,
	inputTrack,
	outputVideoCodec,
}: {
	inputContainer: MediaParserContainer;
	inputTrack: MediaParserVideoTrack;
	rotationToApply: number;
	outputContainer: ConvertMediaContainer;
	outputVideoCodec: ConvertMediaVideoCodec | null;
	resizeOperation: ResizeOperation | null;
}) => {
	if (
		normalizeVideoRotation(inputTrack.rotation) !==
		normalizeVideoRotation(rotationToApply)
	) {
		return false;
	}

	if (outputVideoCodec) {
		if (
			!isSameVideoCodec({
				inputVideoCodec: inputTrack.codecEnum,
				outputCodec: outputVideoCodec,
			})
		) {
			return false;
		}
	}

	const needsToBeMultipleOfTwo = inputTrack.codecEnum === 'h264';

	const newDimensions = calculateNewDimensionsFromRotateAndScale({
		height: inputTrack.height,
		resizeOperation,
		rotation: rotationToApply,
		width: inputTrack.width,
		needsToBeMultipleOfTwo,
	});
	if (
		newDimensions.height !== inputTrack.height ||
		newDimensions.width !== inputTrack.width
	) {
		return false;
	}

	if (outputContainer === 'webm') {
		return inputTrack.codecEnum === 'vp8' || inputTrack.codecEnum === 'vp9';
	}

	if (outputContainer === 'mp4') {
		return (
			(inputTrack.codecEnum === 'h264' || inputTrack.codecEnum === 'h265') &&
			(inputContainer === 'mp4' ||
				inputContainer === 'avi' ||
				(inputContainer === 'm3u8' && inputTrack.m3uStreamFormat === 'mp4'))
		);
	}

	if (outputContainer === 'wav') {
		return false;
	}

	throw new Error(`Unhandled codec: ${outputContainer satisfies never}`);
};
