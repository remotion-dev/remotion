export const makeOfflineMediaFetch = (
	onWaitChanged: ((waiting: boolean) => void) | null,
) => {
	const lifetime = new AbortController();
	const fetchFn = Object.assign(
		async (
			url: Parameters<typeof fetch>[0],
			init?: Parameters<typeof fetch>[1],
		): Promise<Response> => {
			const signal = init?.signal
				? AbortSignal.any([init.signal, lifetime.signal])
				: lifetime.signal;
			for (;;) {
				signal.throwIfAborted();
				try {
					return await fetch(url, {...init, signal});
				} catch (error) {
					if (
						!(error instanceof TypeError) ||
						typeof window === 'undefined' ||
						navigator.onLine !== false ||
						signal.aborted
					) {
						throw error;
					}
					onWaitChanged?.(true);
					try {
						await new Promise<void>((resolve, reject) => {
							const listeners = new AbortController();
							const onOnline = () => {
								listeners.abort();
								resolve();
							};
							const onAbort = () => {
								listeners.abort();
								reject(signal.reason);
							};
							window.addEventListener('online', onOnline, {
								signal: listeners.signal,
							});
							signal.addEventListener('abort', onAbort, {
								once: true,
								signal: listeners.signal,
							});
							if (signal.aborted) {
								onAbort();
							} else if (navigator.onLine !== false) {
								onOnline();
							}
						});
					} finally {
						onWaitChanged?.(false);
					}
				}
			}
		},
		typeof fetch === 'undefined' ? ({} as typeof fetch) : fetch,
	);
	return {fetchFn, dispose: () => lifetime.abort()};
};
