export const makeOfflineMediaFetch = (
	onWaitChanged: ((waiting: boolean) => void) | null,
) => {
	const lifetime = new AbortController();
	const fetchFn = Object.assign(
		async (
			url: Parameters<typeof fetch>[0],
			init?: Parameters<typeof fetch>[1],
		): Promise<Response> => {
			const request = new AbortController();
			const {signal} = request;
			const onRequestAbort = () => request.abort(init?.signal?.reason);
			const onDispose = () => request.abort(lifetime.signal.reason);
			init?.signal?.addEventListener('abort', onRequestAbort, {
				once: true,
				signal,
			});
			lifetime.signal.addEventListener('abort', onDispose, {
				once: true,
				signal,
			});
			if (init?.signal?.aborted) {
				onRequestAbort();
			} else if (lifetime.signal.aborted) {
				onDispose();
			}

			try {
				for (;;) {
					if (signal.aborted) {
						throw (
							signal.reason ??
							new DOMException('The operation was aborted.', 'AbortError')
						);
					}

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

						try {
							onWaitChanged?.(true);
							await new Promise<void>((resolve, reject) => {
								const listeners = new AbortController();
								const onOnline = () => {
									listeners.abort();
									resolve();
								};

								const onAbort = () => {
									listeners.abort();
									reject(
										signal.reason ??
											new DOMException(
												'The operation was aborted.',
												'AbortError',
											),
									);
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
			} catch (error) {
				init?.signal?.removeEventListener('abort', onRequestAbort);
				throw error;
			} finally {
				// After headers, keep the caller's abort forwarding for response-body reads.
				// Input.dispose() owns those reads; this lifetime owns pending fetch/reconnect waits.
				lifetime.signal.removeEventListener('abort', onDispose);
			}
		},
		typeof fetch === 'undefined' ? ({} as typeof fetch) : fetch,
	);
	return {fetchFn, dispose: () => lifetime.abort()};
};
