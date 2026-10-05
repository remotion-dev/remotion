export const fetchWithOfflineRecovery = Object.assign(
	async (
		url: Parameters<typeof fetch>[0],
		init?: Parameters<typeof fetch>[1],
	): Promise<Response> => {
		for (;;) {
			init?.signal?.throwIfAborted();
			try {
				return await fetch(url, init);
			} catch (error) {
				if (
					!(error instanceof TypeError) ||
					typeof window === 'undefined' ||
					navigator.onLine !== false ||
					init?.signal?.aborted
				) {
					throw error;
				}

				// Connectivity alone is not enough: local and cached media can keep rendering.
				window.remotion_offlineMediaFetches =
					(window.remotion_offlineMediaFetches ?? 0) + 1;
				try {
					await new Promise<void>((resolve, reject) => {
						const cleanup = () => {
							window.removeEventListener('online', onOnline);
							init?.signal?.removeEventListener('abort', onAbort);
						};
						const onOnline = () => {
							cleanup();
							resolve();
						};
						const onAbort = () => {
							cleanup();
							reject(init!.signal!.reason);
						};
						window.addEventListener('online', onOnline);
						init?.signal?.addEventListener('abort', onAbort, {once: true});
						if (init?.signal?.aborted) {
							onAbort();
						} else if (navigator.onLine !== false) {
							onOnline();
						}
					});
				} finally {
					window.remotion_offlineMediaFetches--;
				}
			}
		}
	},
	fetch,
);
