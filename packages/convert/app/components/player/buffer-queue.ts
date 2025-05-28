export const makeBufferQueue = () => {
	const bufferedFrames: VideoFrame[] = [];
	const waiters: Array<{
		resolve: () => void;
		threshold: number;
	}> = [];

	const checkWaiters = () => {
		const {length} = bufferedFrames;
		waiters.forEach((waiter, index) => {
			if (length < waiter.threshold) {
				waiter.resolve();
				waiters.splice(index, 1);
			}
		});
	};

	return {
		getNextFrame: () => {
			return bufferedFrames[0];
		},
		shift: () => {
			const frame = bufferedFrames.shift();
			checkWaiters();
			return frame;
		},
		getLength: () => {
			return bufferedFrames.length;
		},
		add: (frame: VideoFrame) => {
			bufferedFrames.push(frame);
		},
		waitForQueueToBeLessThan: (n: number) => {
			if (bufferedFrames.length < n) {
				return Promise.resolve();
			}

			return new Promise<void>((resolve) => {
				waiters.push({
					resolve,
					threshold: n,
				});
			});
		},
		getLastFrame: () => {
			return bufferedFrames[bufferedFrames.length - 1];
		},
	};
};
