declare const __webpack_module__: {
	hot:
		| {
				status: () => string;
				addStatusHandler: (callback: () => void) => void;
				removeStatusHandler: (callback: () => void) => void;
		  }
		| undefined;
};

export const waitForHotUpdate = (hash: string, signal: AbortSignal) => {
	return new Promise<void>((resolve, reject) => {
		const {hot} = __webpack_module__;
		if (!hot) {
			reject(
				new Error(
					'Hot refresh is unavailable. Refresh Studio before exporting.',
				),
			);
			return;
		}

		const cleanup = () => {
			clearTimeout(timeout);
			hot.removeStatusHandler(onStatusChange);
			signal.removeEventListener('abort', onAbort);
		};

		const onAbort = () => {
			cleanup();
			reject(new Error('Preparing the export was cancelled'));
		};

		const check = () => {
			if (hot.status() === 'idle' && __webpack_hash__ === hash) {
				cleanup();
				resolve();
			} else if (hot.status() === 'abort' || hot.status() === 'fail') {
				cleanup();
				reject(
					new Error('Hot refresh failed. Refresh Studio before exporting.'),
				);
			}
		};

		// Let all idle handlers finish, including React Fast Refresh, before
		// resolving or removing our handler from the runtime's listener array.
		const onStatusChange = () => queueMicrotask(check);
		const timeout = setTimeout(() => {
			cleanup();
			reject(
				new Error(
					'Timed out updating the composition. Refresh Studio before exporting.',
				),
			);
		}, 60_000);
		hot.addStatusHandler(onStatusChange);
		signal.addEventListener('abort', onAbort, {once: true});
		if (signal.aborted) {
			onAbort();
		} else {
			check();
		}
	});
};
