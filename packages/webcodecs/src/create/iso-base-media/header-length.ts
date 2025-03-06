export const calculateAReasonableMp4HeaderLength = (
	expectedDurationInSeconds: number | null,
) => {
	if (expectedDurationInSeconds === null) {
		return 2048_000;
	}

	/**
	 * we had a video that was 1 hour 40 minutes long and the header ended up being 3.7MB. the header approximately grows linearly to the video length in seconds, but we should reserve enough, like at least 50KB in any case.
	 * it's better to be safe than to fail, so let's add a 30% safety margin
	 */

	// 1h40m = 6000 seconds resulted in 3.7MB header
	// So bytes per second = 3.7MB / 6000 = ~616 bytes/second
	const bytesPerSecond = (3.7 * 1024 * 1024) / 6000;

	// Add 20% safety margin
	const bytesWithSafetyMargin = bytesPerSecond * 1.2;

	// Calculate based on duration, with minimum 50KB
	const calculatedBytes = Math.max(
		50 * 1024,
		Math.ceil(expectedDurationInSeconds * bytesWithSafetyMargin),
	);

	return calculatedBytes;
};
