export const onlyOneMediaRenderAtATimeQueue = {
	ref: Promise.resolve(),
};

export const onlyOneStillRenderAtATimeQueue = {
	ref: Promise.resolve(),
};

export const runWithRenderQueue = <T>({
	queue,
	render,
	signal,
	createCancellationError,
}: {
	queue: {ref: Promise<void>};
	render: () => Promise<T>;
	signal: AbortSignal | null;
	createCancellationError: () => Error;
}): Promise<T> => {
	if (signal?.aborted) return Promise.reject(createCancellationError());
	let pendingRender: (() => Promise<T>) | null = render;
	let cancellationError: Error | null = null;
	const getCancellationError = () => {
		cancellationError ??= createCancellationError();
		return cancellationError;
	};

	return new Promise<T>((resolve, reject) => {
		let waiting = true;
		const onAbort = () => {
			if (!waiting) return;
			pendingRender = null;
			signal?.removeEventListener('abort', onAbort);
			reject(getCancellationError());
		};

		signal?.addEventListener('abort', onAbort, {once: true});

		const scheduled = queue.ref
			.catch(() => {})
			.then(() => {
				waiting = false;
				signal?.removeEventListener('abort', onAbort);
				const next = pendingRender;
				pendingRender = null;
				if (signal?.aborted || next === null) throw getCancellationError();
				return next();
			});

		// The queued operation still owns its turn after the caller cancels.
		// Releasing it early would let a successor overlap the preceding render.
		queue.ref = scheduled.then(
			() => {},
			() => {},
		);
		scheduled.then(resolve, reject);
		if (signal?.aborted) onAbort();
	});
};
