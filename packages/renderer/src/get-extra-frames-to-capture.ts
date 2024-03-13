// For seamless AAC concatenation, we need to capture a bit of extra audio on both sides
// to later align the audio correctly. This function calculates the exact frames to capture.

import {getClosestAlignedTime} from './combine-audio';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';

type ReturnType = {
	extraFramesToCaptureAssets: number[];
	trimLeftOffset: number;
	trimRightOffset: number;
	chunkLengthInSeconds: number;
};

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
	if (!forSeamlessAacConcatenation) {
		return {
			extraFramesToCaptureAssets: [],
			chunkLengthInSeconds: (realFrameRange[1] - realFrameRange[0] + 1) / fps,
			trimLeftOffset: 0,
			trimRightOffset: 0,
		};
	}

	const chunkStart = realFrameRange[0] / fps;

	if (chunkStart < compositionStart) {
		throw new Error('chunkStart may not be below compositionStart');
	}

	const realLeftEnd = chunkStart - compositionStart;
	if (realLeftEnd < 0) {
		throw new Error('chunkStat - compositionStart may not be below 0');
	}

	const realRightEnd =
		realLeftEnd + (realFrameRange[1] - realFrameRange[0] + 1) / fps;

	const aacAdjustedLeftEnd = Math.max(
		0,
		getClosestAlignedTime(realLeftEnd) - 2 * (1024 / DEFAULT_SAMPLE_RATE),
	);
	const aacAdjustedRightEnd =
		getClosestAlignedTime(realRightEnd) + 2 * (1024 / DEFAULT_SAMPLE_RATE);

	const startTimeWithoutOffset = Math.floor(aacAdjustedLeftEnd * fps);

	// TODO: Prevent floating point issues by dividing and then multiplying by FPS
	const startFrame = startTimeWithoutOffset + compositionStart * fps;

	const trimLeftOffset =
		(aacAdjustedLeftEnd * fps - startTimeWithoutOffset) / fps;

	const endFrame =
		Math.ceil(aacAdjustedRightEnd * fps) + compositionStart * fps;

	const trimRightOffset =
		(aacAdjustedRightEnd * fps - Math.ceil(aacAdjustedRightEnd * fps)) / fps;

	const extraFramesToCaptureAudioOnly = new Array(
		realFrameRange[0] - startFrame,
	)
		.fill(true)
		.map((_, f) => {
			return f + startFrame;
		});

	const extraFramesToCaptureAudioOnlyBackend = new Array(
		endFrame - realFrameRange[1] - 1,
	)
		.fill(true)
		.map((_, f) => {
			return f + realFrameRange[1] + 1;
		});

	const chunkLengthInSeconds = aacAdjustedRightEnd - aacAdjustedLeftEnd;

	return {
		extraFramesToCaptureAssets: [
			...extraFramesToCaptureAudioOnly,
			...extraFramesToCaptureAudioOnlyBackend,
		],
		chunkLengthInSeconds,
		trimLeftOffset,
		trimRightOffset,
	};
};
