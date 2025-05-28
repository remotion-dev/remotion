export const makeFrameBuffer = ({
	drawFrame,
}: {
	drawFrame: (frame: VideoFrame) => void;
}) => {
	let currentTime = 0;
	let playing = false;
	let currentlyDrawnFrame: VideoFrame | null = null;
	const bufferedFrames: VideoFrame[] = [];

	const releaseFrame = (frame: VideoFrame) => {
		if (currentlyDrawnFrame) {
			currentlyDrawnFrame.close();
		}

		drawFrame(frame);
		currentlyDrawnFrame = frame;
		currentTime = frame.timestamp;
	};

	const loop = () => {
		const nextFrame = bufferedFrames[0];

		setTimeout(
			() => {
				if (!playing) {
					return;
				}

				const shifted = bufferedFrames.shift();
				if (shifted) {
					releaseFrame(shifted);
				}

				loop();
			},
			(nextFrame.timestamp - currentTime) / 1000,
		);
	};

	return {
		getBufferedFrames: () => bufferedFrames,
		addFrame: (frame: VideoFrame) => {
			if (
				!currentlyDrawnFrame ||
				Math.abs(currentlyDrawnFrame.timestamp - currentTime) >
					Math.abs(frame.timestamp - currentTime)
			) {
				releaseFrame(frame);
				return;
			}

			bufferedFrames.push(frame);
		},
		play: () => {
			playing = true;
			loop();
		},
	};
};
