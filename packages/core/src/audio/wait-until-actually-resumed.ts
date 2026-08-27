import {Log, type LogLevel} from '../log.js';

const RESUME_WAIT_TIMEOUT = 1000;

export type AudioContextResumeResult = 'resumed' | 'cancelled' | 'failed';

export const waitUntilAudioContextRunning = (
	audioContext: AudioContext,
	signal: AbortSignal,
): Promise<AudioContextResumeResult> => {
	return new Promise((resolve) => {
		let settled = false;
		let onStateChange: () => void = () => undefined;
		let onAbort: () => void = () => undefined;

		const finish = (result: AudioContextResumeResult) => {
			if (settled) {
				return;
			}

			settled = true;
			audioContext.removeEventListener('statechange', onStateChange);
			signal.removeEventListener('abort', onAbort);
			resolve(result);
		};

		onStateChange = () => {
			if (audioContext.state === 'running') {
				finish('resumed');
			}
		};

		onAbort = () => finish('cancelled');

		if (signal.aborted) {
			finish('cancelled');
			return;
		}

		audioContext.addEventListener('statechange', onStateChange);
		signal.addEventListener('abort', onAbort, {once: true});
		onStateChange();
	});
};

export const waitUntilActuallyResumed = (
	audioContext: AudioContext,
	logLevel: LogLevel,
	signal: AbortSignal,
): Promise<AudioContextResumeResult> => {
	return new Promise((resolve) => {
		const startCurrentTime = audioContext.currentTime;
		const start = audioContext.getOutputTimestamp();
		const startOutputPerformanceTime = start.performanceTime;
		const startWallClock = performance.now();
		let animationFrame: number | null = null;
		let timeout: ReturnType<typeof setTimeout> | null = null;
		let settled = false;
		let onAbort: () => void = () => undefined;

		const finish = (result: AudioContextResumeResult) => {
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

			signal.removeEventListener('abort', onAbort);
			resolve(result);
		};

		onAbort = () => finish('cancelled');

		const hasAudiblyStarted = (
			startPerformanceTime: number | undefined,
		): startPerformanceTime is number => {
			const outputTimestamp = audioContext.getOutputTimestamp();
			return (
				startPerformanceTime !== undefined &&
				outputTimestamp.performanceTime !== undefined &&
				outputTimestamp.performanceTime > startPerformanceTime &&
				outputTimestamp.contextTime !== undefined &&
				outputTimestamp.contextTime > startCurrentTime
			);
		};

		const check = () => {
			animationFrame = null;
			const {currentTime} = audioContext;
			const outputTimestamp = audioContext.getOutputTimestamp();
			const elapsedWallClock = performance.now() - startWallClock;

			if (hasAudiblyStarted(startOutputPerformanceTime)) {
				Log.verbose(
					{logLevel, tag: 'audio'},
					`waitUntilActuallyResumed: getOutputTimestamp.performanceTime advanced from ${startOutputPerformanceTime.toFixed(
						6,
					)} to ${outputTimestamp.performanceTime?.toFixed(
						6,
					)} after ${elapsedWallClock.toFixed(
						1,
					)}ms. currentTime=${currentTime.toFixed(6)} (advanced by ${(
						currentTime - startCurrentTime
					).toFixed(6)}), getOutputTimestamp.performanceTime=${
						outputTimestamp.performanceTime?.toFixed(1) ?? 'undefined'
					}`,
				);
				finish('resumed');
				return;
			}

			animationFrame = requestAnimationFrame(check);
		};

		if (signal.aborted) {
			finish('cancelled');
			return;
		}

		signal.addEventListener('abort', onAbort, {once: true});
		timeout = setTimeout(() => {
			// The success check is scheduled with requestAnimationFrame, which can
			// be starved while the main thread is busy. Re-check once before
			// declaring failure so a resume that actually completed is not
			// reported as failed - the Player would otherwise mute itself even
			// though playback was started by a user gesture and audio is running.
			if (hasAudiblyStarted(startOutputPerformanceTime)) {
				finish('resumed');
				return;
			}

			Log.warn(
				{logLevel, tag: 'audio'},
				'WARNING: You enabled autoPlay on an unmuted <Player /> and the browser did not allow the video to be started. Remotion muted the <Player /> so it can play. To properly handle this, either set the `muted` prop or remove the `autoPlay` prop',
			);
			finish('failed');
		}, RESUME_WAIT_TIMEOUT);
		animationFrame = requestAnimationFrame(check);
	});
};
