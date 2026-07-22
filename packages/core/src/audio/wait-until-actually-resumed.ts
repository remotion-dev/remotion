import {Log, type LogLevel} from '../log.js';

const RESUME_WAIT_DEADLINE_MS = 1000;

export const waitUntilActuallyResumed = (
	audioContext: AudioContext,
	logLevel: LogLevel,
	// The output timestamp only advances while the context is running. If a
	// suspend() supersedes the resume we are waiting for, it will never
	// advance again and this poll would spin forever - so the caller passes
	// its intent and we settle as soon as the intent to play is withdrawn.
	shouldStillWait: () => boolean,
): Promise<void> => {
	return new Promise((resolve) => {
		const startCurrentTime = audioContext.currentTime;
		const start = audioContext.getOutputTimestamp();
		const startOutputPerformanceTime = start.performanceTime;
		const startWallClock = performance.now();

		const check = () => {
			if (!shouldStillWait()) {
				Log.verbose(
					{logLevel, tag: 'audio'},
					'waitUntilActuallyResumed: a suspend superseded the resume, settling',
				);
				resolve();
				return;
			}

			// A resume() can also hang while the intent to play remains, e.g. when
			// an autoplay policy blocks a resume issued outside a user gesture. In
			// that case it is better to keep ticking without audio sync than to
			// stall the playback loop, so give up waiting after a deadline.
			if (performance.now() - startWallClock > RESUME_WAIT_DEADLINE_MS) {
				Log.warn(
					{logLevel, tag: 'audio'},
					`waitUntilActuallyResumed: resume did not complete within ${RESUME_WAIT_DEADLINE_MS}ms, continuing without audio sync`,
				);
				resolve();
				return;
			}

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
				resolve();
				return;
			}

			requestAnimationFrame(check);
		};

		requestAnimationFrame(check);
	});
};
