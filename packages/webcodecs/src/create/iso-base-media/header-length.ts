export const calculateAReasonableMp4HeaderLength = ({
	expectedDurationInSeconds,
	expectedFrameRate,
}: {
	expectedDurationInSeconds: number | null;
	expectedFrameRate: number | null;
}) => {
	if (expectedDurationInSeconds === null) {
		return 2048_000;
	}

	/**
	 * we had a video that was 1 hour 40 minutes long and the header ended up being 3.7MB. the header approximately grows linearly to the video length in seconds, but we should reserve enough, like at least 50KB in any case.
	 * it's better to be safe than to fail, so let's add a 30% safety margin
	 */

	// This was however with 30fps, and there can also be 60fps videos, so let's
	// estimate even more conservatively and estimate 60fps
	const assumedFrameRate = expectedFrameRate ?? 60;
	const frameRateMultiplier = assumedFrameRate / 30;

	// 1h40m = 6000 seconds resulted in 3.7MB header
	// So bytes per second = 3.7MB / 6000 = ~616 bytes/second
	const bytesPerSecond = (3.7 * 1024 * 1024) / 6000;

	// Add 20% safety margin and multiply by frame rate multiplier
	const bytesWithSafetyMargin = bytesPerSecond * 1.2 * frameRateMultiplier;

	// Calculate based on duration, with minimum 50KB
	const calculatedBytes = Math.max(
		50 * 1024,
		Math.ceil(expectedDurationInSeconds * bytesWithSafetyMargin),
	);

	return calculatedBytes;
};
