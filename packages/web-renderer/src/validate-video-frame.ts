/**
 * Validates and processes a VideoFrame returned from an onFrame callback
 */

export type OnFrameCallback = (
	frame: VideoFrame,
) => VideoFrame | Promise<VideoFrame>;

export type ValidateVideoFrameOptions = {
	originalFrame: VideoFrame;
	returnedFrame: VideoFrame;
	expectedWidth: number;
	expectedHeight: number;
	expectedTimestamp: number;
};

/**
 * Validates that a VideoFrame returned from onFrame callback matches expected dimensions and timestamp
 * If validation fails, closes both frames and throws an error
 */
export const validateVideoFrame = ({
	originalFrame,
	returnedFrame,
	expectedWidth,
	expectedHeight,
	expectedTimestamp,
}: ValidateVideoFrameOptions): VideoFrame => {
	// If onFrame returned void/undefined, use the original frame
	if (!returnedFrame) {
		return originalFrame;
	}

	// Validate that the returned frame is actually a VideoFrame
	if (!(returnedFrame instanceof VideoFrame)) {
		originalFrame.close();
		throw new Error('onFrame callback must return a VideoFrame or void');
	}

	// Check if it's the same frame (no validation needed)
	if (returnedFrame === originalFrame) {
		return returnedFrame;
	}

	// Validate dimensions
	if (
		returnedFrame.displayWidth !== expectedWidth ||
		returnedFrame.displayHeight !== expectedHeight
	) {
		originalFrame.close();
		returnedFrame.close();
		throw new Error(
			`VideoFrame dimensions mismatch: expected ${expectedWidth}x${expectedHeight}, got ${returnedFrame.displayWidth}x${returnedFrame.displayHeight}`,
		);
	}

	// Validate timestamp
	if (returnedFrame.timestamp !== expectedTimestamp) {
		originalFrame.close();
		returnedFrame.close();
		throw new Error(
			`VideoFrame timestamp mismatch: expected ${expectedTimestamp}, got ${returnedFrame.timestamp}`,
		);
	}

	// If we got a different frame but it's valid, close the original and use the new one
	originalFrame.close();
	return returnedFrame;
};
