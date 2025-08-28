export type KeyframeBank = {
	frames: VideoFrame[];
	startTimestamp: number;
	endTimestamp: number;
	getFrameFromTimestamp: (timestamp: number) => VideoFrame;
};

export const makeKeyframeBank = ({
	startTimestamp,
	endTimestamp,
}: {
	startTimestamp: number;
	endTimestamp: number;
}) => {
	const frames: VideoFrame[] = [];
	const keyframeBank: KeyframeBank = {
		frames,
		startTimestamp,
		endTimestamp,
		getFrameFromTimestamp: (timestampInSeconds) => {
			if (timestampInSeconds < startTimestamp * 1_000_000) {
				throw new Error('Timestamp is before start timestamp');
			}

			if (timestampInSeconds > endTimestamp * 1_000_000) {
				throw new Error('Timestamp is after end timestamp');
			}

			for (let i = frames.length - 1; i >= 0; i--) {
				const frame = frames[i];
				if (frame.timestamp <= timestampInSeconds * 1_000_000) {
					return frame;
				}
			}

			throw new Error('No frame found for timestamp ' + timestampInSeconds);
		},
	};

	return keyframeBank;
};
