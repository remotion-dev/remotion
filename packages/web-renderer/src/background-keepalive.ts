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

	const blob = new Blob([WORKER_CODE], {type: 'application/javascript'});
	const workerUrl = URL.createObjectURL(blob);
	worker = new Worker(workerUrl);

	worker.onmessage = () => {
		const resolvers = pendingResolvers;
		pendingResolvers = [];
		for (const resolve of resolvers) {
			resolve();
		}
	};

	worker.postMessage({type: 'start', intervalMs});

	return {
		waitForTick: () => {
			return new Promise((resolve) => {
				pendingResolvers.push(resolve);
			});
		},
		[Symbol.dispose]: () => {
			if (disposed) {
				return;
			}

			disposed = true;
			worker?.postMessage({type: 'stop'});
			worker?.terminate();
			worker = null;
			URL.revokeObjectURL(workerUrl);

			const resolvers = pendingResolvers;
			pendingResolvers = [];
			for (const resolve of resolvers) {
				resolve();
			}
		},
	};
}
