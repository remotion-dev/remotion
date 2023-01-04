type Callback = () => void;

export type CancelSignal = (callback: Callback) => void;

export const makeCancelSignal = (): {
	cancelSignal: CancelSignal;
	cancel: () => void;
} => {
	const callbacks: Callback[] = [];
	let cancelled = false;
	return {
		cancelSignal: (callback: Callback) => {
			callbacks.push(callback);
			if (cancelled) {
				callback();
			}
		},
		cancel: () => {
			if (cancelled) {
				return;
			}

			callbacks.forEach((cb) => {
				cb();
			});
			cancelled = true;
		},
	};
};

export const cancelErrorMessages = {
	renderMedia: 'renderMedia() got cancelled',
	renderFrames: 'renderFrames() got cancelled',
	renderStill: 'renderStill() got cancelled',
	stitchFramesToVideo: 'stitchFramesToVideo() got cancelled',
};

export const isUserCancelledRender = (err: unknown) => {
	if (
		typeof err === 'object' &&
		err !== null &&
		'message' in err &&
		typeof err.message === 'string'
	) {
		return (
			err.message.includes(cancelErrorMessages.renderMedia) ||
			err.message.includes(cancelErrorMessages.renderFrames) ||
			err.message.includes(cancelErrorMessages.renderStill) ||
			err.message.includes(cancelErrorMessages.stitchFramesToVideo)
		);
	}

	return false;
};
