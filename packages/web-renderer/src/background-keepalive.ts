import {Internals, type LogLevel} from 'remotion';

export type BackgroundKeepalive = {
	waitForTick: () => Promise<void>;
	[Symbol.dispose]: () => void;
};

const WORKER_CODE = `
let intervalId = null;
self.onmessage = (e) => {
	if (e.data.type === 'start') {
		if (intervalId !== null) {
			clearInterval(intervalId);
		}
		intervalId = setInterval(() => self.postMessage('tick'), e.data.intervalMs);
	} else if (e.data.type === 'stop') {
		if (intervalId !== null) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}
};
`;

export function createBackgroundKeepalive({
	fps,
	logLevel,
}: {
	fps: number;
	logLevel: LogLevel;
}): BackgroundKeepalive {
	const intervalMs = Math.round(1000 / fps);

	let pendingResolvers: Array<() => void> = [];
	let worker: Worker | null = null;
	let disposed = false;

	if (typeof Worker === 'undefined') {
		Internals.Log.warn(
			{logLevel, tag: '@remotion/web-renderer'},
			'Web Workers not available. Rendering may pause when tab is backgrounded.',
		);

		return {
			waitForTick: () => {
				return new Promise((resolve) => {
					setTimeout(resolve, intervalMs);
				});
			},
			[Symbol.dispose]: () => {},
		};
	}

	let workerUrl: string | null = null;
	const releaseWorker = () => {
		worker?.terminate();
		worker = null;
		if (workerUrl !== null) {
			URL.revokeObjectURL(workerUrl);
			workerUrl = null;
		}
	};

	try {
		const blob = new Blob([WORKER_CODE], {type: 'application/javascript'});
		workerUrl = URL.createObjectURL(blob);
		worker = new Worker(workerUrl);

		worker.onmessage = () => {
			const resolvers = pendingResolvers;
			pendingResolvers = [];
			for (const resolve of resolvers) {
				resolve();
			}
		};

		worker.onerror = (event) => {
			Internals.Log.error(
				{logLevel, tag: '@remotion/web-renderer'},
				'Background keepalive worker encountered an error and will be terminated.',
				event,
			);

			const resolvers = pendingResolvers;
			pendingResolvers = [];
			for (const resolve of resolvers) {
				resolve();
			}

			if (!disposed) {
				disposed = true;
				releaseWorker();
			}
		};

		worker.postMessage({type: 'start', intervalMs});
	} catch (error) {
		Internals.Log.warn(
			{logLevel, tag: '@remotion/web-renderer'},
			'Background keepalive worker could not start. Using a timer fallback.',
			error,
		);
		releaseWorker();
	}

	return {
		waitForTick: () => {
			return new Promise((resolve) => {
				// A failed worker has already released its pending waits. Keep later
				// readiness checks progressing with the same timer fallback as above.
				if (worker === null) {
					setTimeout(resolve, intervalMs);
					return;
				}

				pendingResolvers.push(resolve);
			});
		},
		[Symbol.dispose]: () => {
			if (disposed) {
				return;
			}

			disposed = true;
			worker?.postMessage({type: 'stop'});
			releaseWorker();

			const resolvers = pendingResolvers;
			pendingResolvers = [];
			for (const resolve of resolvers) {
				resolve();
			}
		},
	};
}
