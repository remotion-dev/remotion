export const calculateNextFrame = ({
	time,
	currentFrame: startFrame,
	playbackSpeed,
	fps,
	actualLastFrame,
	actualFirstFrame,
	framesAdvanced,
	shouldLoop,
}: {
	time: number;
	currentFrame: number;
	playbackSpeed: number;
	fps: number;
	actualFirstFrame: number;
	actualLastFrame: number;
	framesAdvanced: number;
	shouldLoop: boolean;
}): {nextFrame: number; framesToAdvance: number; hasEnded: boolean} => {
	const op = playbackSpeed < 0 ? Math.ceil : Math.floor;
	const framesToAdvance =
		op((time * playbackSpeed) / (1000 / fps)) - framesAdvanced;

	const nextFrame = framesToAdvance + startFrame;
	const isCurrentFrameOutside =
		startFrame > actualLastFrame || startFrame < actualFirstFrame;
	const isNextFrameOutside =
		nextFrame > actualLastFrame || nextFrame < actualFirstFrame;

	const hasEnded = !shouldLoop && isNextFrameOutside && !isCurrentFrameOutside;
	if (shouldLoop && isNextFrameOutside && !isCurrentFrameOutside) {
		// Preserve elapsed frames across complete loops in either direction.
		const playbackRange = actualLastFrame - actualFirstFrame + 1;
		const frameWithinRange = (nextFrame - actualFirstFrame) % playbackRange;
		return {
			nextFrame:
				actualFirstFrame + ((frameWithinRange + playbackRange) % playbackRange),
			framesToAdvance,
			hasEnded,
		};
	}

	if (playbackSpeed > 0) {
		// Play forwards
		if (isNextFrameOutside) {
			return {
				nextFrame: actualFirstFrame,
				framesToAdvance,
				hasEnded,
			};
		}

		return {nextFrame, framesToAdvance, hasEnded};
	}

	// Reverse playback
	if (isNextFrameOutside) {
		return {nextFrame: actualLastFrame, framesToAdvance, hasEnded};
	}

	return {nextFrame, framesToAdvance, hasEnded};
};
