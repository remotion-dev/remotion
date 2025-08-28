export type KeyframeBank = {
	frames: VideoFrame[];
	startTimestampInSeconds: number;
	endTimestampInSeconds: number;
	getFrameFromTimestamp: (timestamp: number) => Promise<VideoFrame>;
	prepareForDeletion: () => void;
};

export const makeKeyframeBank = ({
	startTimestampInSeconds,
	endTimestampInSeconds,
}: {
	startTimestampInSeconds: number;
	endTimestampInSeconds: number;
}) => {
	const frames: VideoFrame[] = [];

	const getFrameFromTimestamp = (
		timestampInSeconds: number,
	): Promise<VideoFrame> => {
		if (timestampInSeconds < startTimestampInSeconds) {
			return Promise.reject(
				new Error(
					`Timestamp is before start timestamp (requested: ${timestampInSeconds}sec, start: ${startTimestampInSeconds})`,
				),
			);
		}

		if (timestampInSeconds > endTimestampInSeconds) {
			return Promise.reject(
				new Error(
					`Timestamp is after end timestamp (requested: ${timestampInSeconds}sec, end: ${endTimestampInSeconds})`,
				),
			);
		}

		for (let i = frames.length - 1; i >= 0; i--) {
			const frame = frames[i];
			if (frame.timestamp <= timestampInSeconds * 1_000_000) {
				return Promise.resolve(frame);
			}
		}

		return Promise.reject(
			new Error('No frame found for timestamp ' + timestampInSeconds),
		);
	};

	const prepareForDeletion = () => {
		for (const frame of frames) {
			frame.close();
		}

		frames.length = 0;
	};

	const keyframeBank: KeyframeBank = {
		frames,
		startTimestampInSeconds,
		endTimestampInSeconds,
		getFrameFromTimestamp,
		prepareForDeletion,
	};

	return keyframeBank;
};
