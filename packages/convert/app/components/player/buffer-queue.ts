export const makeBufferQueue = (onQueueChanged: () => void) => {
	const bufferedFrames: VideoFrame[] = [];
	const waiters: Array<{
		resolve: (canceled: boolean) => void;
		threshold: number;
	}> = [];

	const checkWaiters = () => {
		const {length} = bufferedFrames;
		waiters.forEach((waiter, index) => {
			if (length < waiter.threshold) {
				waiter.resolve(false);
				waiters.splice(index, 1);
			}
		});
	};

	return {
		getBufferedTimestamps: () => {
			return bufferedFrames.map((b) => b.timestamp);
		},
		canProcessSeekWithQueue: (
			timestamp: number,
			currentlyDrawnFrame: number | null,
		) => {
			const hasFramesBefore =
				bufferedFrames.some((f) => f.timestamp <= timestamp) ||
				(currentlyDrawnFrame !== null && currentlyDrawnFrame <= timestamp);
			const hasFramesAfter = bufferedFrames.some(
				(f) => f.timestamp >= timestamp,
			);
			return hasFramesBefore && hasFramesAfter;
		},
		processSeekWithQueue: (timestamp: number) => {
			let framesToDelete = 0;
			for (const frame of bufferedFrames) {
				if (frame.timestamp < timestamp) {
					framesToDelete++;
				} else {
					break;
				}
			}

			const returned = bufferedFrames.splice(0, framesToDelete);
			checkWaiters();
			onQueueChanged();
			return returned;
		},
		getNextFrame: () => {
			return bufferedFrames[0];
		},
		shift: () => {
			const frame = bufferedFrames.shift();
			onQueueChanged();

			checkWaiters();
			return frame;
		},
		getLength: () => {
			return bufferedFrames.length;
		},
		add: (frame: VideoFrame) => {
			bufferedFrames.push(frame);
			onQueueChanged();
		},
		waitForQueueToBeLessThan: (n: number) => {
			if (bufferedFrames.length < n) {
				return Promise.resolve(false);
			}

			return new Promise<boolean>((resolve) => {
				waiters.push({
					resolve,
					threshold: n,
				});
			});
		},
		clearBecauseOfSeek: () => {
			waiters.forEach((waiter) => {
				waiter.resolve(true);
			});
			waiters.length = 0;
			for (let i = 0; i < bufferedFrames.length; i++) {
				bufferedFrames[i].close();
			}

			bufferedFrames.length = 0;
			onQueueChanged();
		},
		getLastFrame: () => {
			return bufferedFrames[bufferedFrames.length - 1];
		},
	};
};
