type Callback = () => void;

export type CancelSignal = (callback: Callback) => void;

/*
 * @description Returns a signal and a cancel function that allows to you cancel a render triggered using renderMedia(), renderStill(), renderFrames() or stitchFramesToVideo().
 * @see [Documentation](https://www.remotion.dev/docs/renderer/make-cancel-signal)
 */
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
		typeof (err as Error).message === 'string'
	) {
		return (
			(err as Error).message.includes(cancelErrorMessages.renderMedia) ||
			(err as Error).message.includes(cancelErrorMessages.renderFrames) ||
			(err as Error).message.includes(cancelErrorMessages.renderStill) ||
			(err as Error).message.includes(cancelErrorMessages.stitchFramesToVideo)
		);
	}

	return false;
};
