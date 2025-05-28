export const makeBufferQueue = () => {
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
		},
		getLastFrame: () => {
			return bufferedFrames[bufferedFrames.length - 1];
		},
	};
};
