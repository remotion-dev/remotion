import {Log, type LogLevel} from '../log.js';

const RESUME_WAIT_TIMEOUT = 1000;

export const waitUntilActuallyResumed = (
	audioContext: AudioContext,
	logLevel: LogLevel,
	signal: AbortSignal,
): Promise<void> => {
	return new Promise((resolve) => {
		const startCurrentTime = audioContext.currentTime;
		const start = audioContext.getOutputTimestamp();
		const startOutputPerformanceTime = start.performanceTime;
		const startWallClock = performance.now();
		let animationFrame: number | null = null;
		let timeout: ReturnType<typeof setTimeout> | null = null;
		let settled = false;

		const finish = () => {
			if (settled) {
				return;
			}

			settled = true;
			if (animationFrame !== null) {
				cancelAnimationFrame(animationFrame);
			}

			if (timeout !== null) {
				clearTimeout(timeout);
			}

			signal.removeEventListener('abort', finish);
			resolve();
		};

		const check = () => {
			animationFrame = null;
			const {currentTime} = audioContext;
			const outputTimestamp = audioContext.getOutputTimestamp();
			const elapsedWallClock = performance.now() - startWallClock;

			if (
				startOutputPerformanceTime !== undefined &&
				outputTimestamp.performanceTime !== undefined &&
				outputTimestamp.performanceTime > startOutputPerformanceTime &&
				outputTimestamp.contextTime !== undefined &&
				outputTimestamp.contextTime > startCurrentTime
			) {
				Log.verbose(
					{logLevel, tag: 'audio'},
					`waitUntilActuallyResumed: getOutputTimestamp.performanceTime advanced from ${startOutputPerformanceTime.toFixed(
						6,
					)} to ${outputTimestamp.performanceTime.toFixed(
						6,
					)} after ${elapsedWallClock.toFixed(
						1,
					)}ms. currentTime=${currentTime.toFixed(6)} (advanced by ${(
						currentTime - startCurrentTime
					).toFixed(6)}), getOutputTimestamp.performanceTime=${
						outputTimestamp.performanceTime?.toFixed(1) ?? 'undefined'
					}`,
				);
				finish();
				return;
			}

			animationFrame = requestAnimationFrame(check);
		};

		if (signal.aborted) {
			finish();
			return;
		}

		signal.addEventListener('abort', finish, {once: true});
		timeout = setTimeout(() => {
			Log.warn(
				{logLevel, tag: 'audio'},
				`AudioContext did not resume within ${RESUME_WAIT_TIMEOUT}ms, continuing playback without audio sync`,
			);
			finish();
		}, RESUME_WAIT_TIMEOUT);
		animationFrame = requestAnimationFrame(check);
	});
};
