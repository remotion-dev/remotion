export const makeFrameBuffer = ({
	drawFrame,
}: {
	drawFrame: (frame: VideoFrame) => void;
}) => {
	const currentTime = 0;
	let currentlyDrawnFrame: VideoFrame | null = null;
	const bufferedFrames: VideoFrame[] = [];

	return {
		getBufferedFrames: () => bufferedFrames,
		addFrame: (frame: VideoFrame) => {
			if (
				!currentlyDrawnFrame ||
				Math.abs(currentlyDrawnFrame.timestamp - currentTime) >
					Math.abs(frame.timestamp - currentTime)
			) {
				currentlyDrawnFrame = frame;
				drawFrame(frame);
			}

			bufferedFrames.push(frame);
		},
	};
};
