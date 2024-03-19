// For seamless AAC concatenation, we need to capture a bit of extra audio on both sides
// to later align the audio correctly. This function calculates the exact frames to capture.

import {getClosestAlignedTime} from './combine-audio';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';

type ReturnType = {
	extraFramesToCaptureAssetsFrontend: number[];
	extraFramesToCaptureAssetsBackend: number[];
	trimLeftOffset: number;
	trimRightOffset: number;
	chunkLengthInSeconds: number;
};

// Inspired by https://github.com/wistia/seamless-aac-split-and-stitch-demo
// We can seamlessly concatenate AAC files if we capture a bit of extra audio on both sides in each chunk and then align the audio correctly.
// This function calculates which extra frames should be evaluated for their audio content.
export const getExtraFramesToCapture = ({
	compositionStart,
	realFrameRange,
	fps,
	forSeamlessAacConcatenation,
}: {
	fps: number;
	compositionStart: number;
	realFrameRange: [number, number];
	forSeamlessAacConcatenation: boolean;
}): ReturnType => {
	// If the feature is disabled, don't capture extra frames.
	if (!forSeamlessAacConcatenation) {
		return {
			extraFramesToCaptureAssetsBackend: [],
			extraFramesToCaptureAssetsFrontend: [],
			chunkLengthInSeconds: (realFrameRange[1] - realFrameRange[0] + 1) / fps,
			trimLeftOffset: 0,
			trimRightOffset: 0,
		};
	}

	// If this video is just a chunk as part of a larger video,
	// We also need to know the start time of this chunk to align it correctly.
	const chunkStart = realFrameRange[0];

	// If we are only rendering a portion of the composition, we also need to account for that.
	// It cannot be that the chunk start time is earlier than the composition time.
	if (chunkStart < compositionStart) {
		throw new Error('chunkStart may not be below compositionStart');
	}

	const realLeftEnd = chunkStart - compositionStart;
	if (realLeftEnd < 0) {
		throw new Error('chunkStat - compositionStart may not be below 0');
	}

	const realRightEnd =
		realLeftEnd + (realFrameRange[1] - realFrameRange[0] + 1);

	// Find the closest AAC packet border and add two AAC packet padding.
	const aacAdjustedLeftEnd = Math.max(
		0,
		getClosestAlignedTime(realLeftEnd / fps) - 2 * (1024 / DEFAULT_SAMPLE_RATE),
	);
	const aacAdjustedRightEnd =
		getClosestAlignedTime(realRightEnd / fps) +
		2 * (1024 / DEFAULT_SAMPLE_RATE);

	// Now find the additional frames that we need to capture to have enough audio
	const alignedStartFrameWithoutOffset = Math.floor(aacAdjustedLeftEnd * fps);
	const alignedStartFrame = alignedStartFrameWithoutOffset + compositionStart;
	const alignedEndFrame =
		Math.ceil(aacAdjustedRightEnd * fps) + compositionStart;
	const extraFramesToCaptureAudioOnlyFrontend = new Array(
		realFrameRange[0] - alignedStartFrame,
	)
		.fill(true)
		.map((_, f) => f + alignedStartFrame);

	const extraFramesToCaptureAudioOnlyBackend = new Array(
		alignedEndFrame - realFrameRange[1] - 1,
	)
		.fill(true)
		.map((_, f) => f + realFrameRange[1] + 1);

	// But now, we might have too much audio, since the extra frames only have a `1 / fps` step.
	// When creating the lossless audio for a chunk, we need to shave that extra audio off.
	const trimLeftOffset =
		(aacAdjustedLeftEnd * fps - alignedStartFrameWithoutOffset) / fps;
	const trimRightOffset =
		(aacAdjustedRightEnd * fps - Math.ceil(aacAdjustedRightEnd * fps)) / fps;

	const chunkLengthInSeconds = aacAdjustedRightEnd - aacAdjustedLeftEnd;

	return {
		extraFramesToCaptureAssetsFrontend: extraFramesToCaptureAudioOnlyFrontend,
		extraFramesToCaptureAssetsBackend: extraFramesToCaptureAudioOnlyBackend,
		chunkLengthInSeconds,
		trimLeftOffset,
		trimRightOffset,
	};
};
