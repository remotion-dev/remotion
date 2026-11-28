import {Log, type LogLevel} from '../log.js';

const RESUME_WAIT_TIMEOUT = 1000;

export type AudioContextResumeResult = 'resumed' | 'cancelled' | 'failed';

export const waitUntilActuallyResumed = (
	audioContext: AudioContext,
	logLevel: LogLevel,
	signal: AbortSignal,
	isAutoPlayAttempt: boolean,
): Promise<AudioContextResumeResult> => {
	return new Promise((resolve) => {
		// Cancellation wins before any native audio call is made.
		if (signal.aborted) {
			resolve('cancelled');
			return;
		}

		// https://github.com/remotion-dev/remotion/issues/13345
		// Firefox can block the main thread inside AudioContext.getOutputTimestamp(),
		// both when it is called on entry and while polling. A JavaScript timeout
		// cannot recover from that, so Firefox never calls it. There, playback is
		// considered started once the context is running and its own clock has
		// advanced. This does not account for output latency, so it can report
		// the start earlier than the output timestamp would.
		const usesOutputTimestamp =
			typeof navigator === 'undefined' ||
			!navigator.userAgent.includes('Firefox/');
		const startCurrentTime = audioContext.currentTime;
		const start = usesOutputTimestamp
			? audioContext.getOutputTimestamp()
			: null;
		const startOutputPerformanceTime = start?.performanceTime;
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
		): boolean => {
			if (!usesOutputTimestamp) {
				return (
					audioContext.state === 'running' &&
					audioContext.currentTime > startCurrentTime
				);
			}

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
			const outputTimestamp = usesOutputTimestamp
				? audioContext.getOutputTimestamp()
				: null;
			const elapsedWallClock = performance.now() - startWallClock;

			if (hasAudiblyStarted(startOutputPerformanceTime)) {
				Log.verbose(
					{logLevel, tag: 'audio'},
					outputTimestamp === null
						? `waitUntilActuallyResumed: currentTime advanced by ${(
								currentTime - startCurrentTime
							).toFixed(6)} after ${elapsedWallClock.toFixed(
								1,
							)}ms (getOutputTimestamp is skipped in Firefox)`
						: `waitUntilActuallyResumed: getOutputTimestamp.performanceTime advanced from ${startOutputPerformanceTime?.toFixed(
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

		signal.addEventListener('abort', onAbort, {once: true});
		if (isAutoPlayAttempt) {
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
		}

		animationFrame = requestAnimationFrame(check);
	});
};
