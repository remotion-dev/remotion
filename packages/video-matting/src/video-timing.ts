export const rebaseVideoTimestamp = ({
	timestamp,
	firstVideoTimestamp,
}: {
	timestamp: number;
	firstVideoTimestamp: number;
}): number => {
	if (!Number.isFinite(timestamp) || !Number.isFinite(firstVideoTimestamp)) {
		throw new TypeError('Video timestamps must be finite numbers.');
	}

	const rebased = timestamp - firstVideoTimestamp;
	if (rebased < -Number.EPSILON * 16) {
		throw new Error('Video frames must be in presentation order.');
	}

	return Math.max(0, rebased);
};

export const getClippedVideoFrameTiming = ({
	timestamp,
	duration,
	videoStartTimestamp,
	videoEndTimestamp,
}: {
	timestamp: number;
	duration: number;
	videoStartTimestamp: number;
	videoEndTimestamp: number;
}): {timestamp: number; duration: number} | null => {
	if (!Number.isFinite(timestamp)) {
		throw new TypeError('The video frame timestamp must be finite.');
	}

	if (!Number.isFinite(duration) || duration < 0) {
		throw new TypeError('The video frame duration must be non-negative.');
	}

	if (
		!Number.isFinite(videoStartTimestamp) ||
		!Number.isFinite(videoEndTimestamp) ||
		videoEndTimestamp < videoStartTimestamp
	) {
		throw new TypeError('The video presentation range is invalid.');
	}

	const visibleStart = Math.max(timestamp, videoStartTimestamp);
	const visibleEnd = Math.min(timestamp + duration, videoEndTimestamp);
	if (visibleEnd <= visibleStart) {
		return null;
	}

	return {
		timestamp: visibleStart - videoStartTimestamp,
		duration: visibleEnd - visibleStart,
	};
};

export const getVideoProcessingProgress = ({
	timestamp,
	duration,
	firstVideoTimestamp,
	durationInSeconds,
}: {
	timestamp: number;
	duration: number;
	firstVideoTimestamp: number;
	durationInSeconds: number;
}): {processedDurationInSeconds: number; progress: number} => {
	if (!Number.isFinite(duration) || duration < 0) {
		throw new TypeError('Video frame durations must be non-negative.');
	}

	if (!Number.isFinite(durationInSeconds) || durationInSeconds < 0) {
		throw new TypeError('The video duration must be non-negative.');
	}

	const rebasedTimestamp = rebaseVideoTimestamp({
		timestamp,
		firstVideoTimestamp,
	});
	const processedDurationInSeconds = Math.min(
		durationInSeconds,
		Math.max(0, rebasedTimestamp + duration),
	);

	return {
		processedDurationInSeconds,
		progress:
			durationInSeconds === 0
				? 1
				: Math.min(1, processedDurationInSeconds / durationInSeconds),
	};
};
