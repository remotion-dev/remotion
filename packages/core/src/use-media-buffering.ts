import type React from 'react';
import {useEffect, useState} from 'react';
import type {LogLevel} from './log';
import {playbackLogging} from './playback-logging';
import {useBufferState} from './use-buffer-state';

export const useMediaBuffering = ({
	element,
	shouldBuffer,
	isPremounting,
	isPostmounting,
	logLevel,
	mountTime,
	src,
}: {
	element: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>;
	shouldBuffer: boolean;
	isPremounting: boolean;
	isPostmounting: boolean;
	logLevel: LogLevel;
	mountTime: number;
	src: string | null;
}) => {
	const buffer = useBufferState();
	const [isBuffering, setIsBuffering] = useState(false);

	// Buffer state based on `waiting` and `canplay`
	useEffect(() => {
		let cleanupFns: ((reason: string) => unknown)[] = [];

		const {current} = element;
		if (!current) {
			return;
		}

		if (!shouldBuffer) {
			return;
		}

		if (isPremounting || isPostmounting) {
			// Needed by iOS Safari which will not load by default
			// and therefore not fire the canplay event.

			// Be cautious about using `current.load()` as it will
			// reset if a video is already playing.
			// Therefore only calling it after checking if the video
			// has no future data.

			// Breaks on Firefox though: https://github.com/remotion-dev/remotion/issues/3915
			if (
				(isPremounting || isPostmounting) &&
				current.readyState < current.HAVE_FUTURE_DATA
			) {
				if (!navigator.userAgent.includes('Firefox/')) {
					playbackLogging({
						logLevel,
						message: `Calling .load() on ${current.src} because readyState is ${current.readyState} and it is not Firefox. Element is premounted ${current.playbackRate}`,
						tag: 'load',
						mountTime,
					});
					const previousPlaybackRate = current.playbackRate;
					current.load();
					current.playbackRate = previousPlaybackRate;
				}
			}

			// Don't trigger buffering during premount or postmount
			return;
		}

		const cleanup = (reason: string) => {
			let didDoSomething = false;
			cleanupFns.forEach((fn) => {
				fn(reason);
				didDoSomething = true;
			});
			cleanupFns = [];
			setIsBuffering((previous) => {
				if (previous) {
					didDoSomething = true;
				}

				return false;
			});
			if (didDoSomething) {
				playbackLogging({
					logLevel,
					message: `Unmarking as buffering: ${current.src}. Reason: ${reason}`,
					tag: 'buffer',
					mountTime,
				});
			}
		};

		const blockMedia = (reason: string) => {
			setIsBuffering(true);
			playbackLogging({
				logLevel,
				message: `Marking as buffering: ${current.src}. Reason: ${reason}`,
				tag: 'buffer',
				mountTime,
			});
			const {unblock} = buffer.delayPlayback();
			const onCanPlay = () => {
				cleanup('"canplay" was fired');
				// eslint-disable-next-line @typescript-eslint/no-use-before-define
				init();
			};

			const onError = () => {
				cleanup('"error" event was occurred');
				// eslint-disable-next-line @typescript-eslint/no-use-before-define
				init();
			};

			current.addEventListener('canplay', onCanPlay, {
				once: true,
			});
			cleanupFns.push(() => {
				current.removeEventListener('canplay', onCanPlay);
			});

			current.addEventListener('error', onError, {
				once: true,
			});
			cleanupFns.push(() => {
				current.removeEventListener('error', onError);
			});
			cleanupFns.push((cleanupReason) => {
				playbackLogging({
					logLevel,
					message: `Unblocking ${current.src} from buffer. Reason: ${cleanupReason}`,
					tag: 'buffer',
					mountTime,
				});
				unblock();
			});
		};

		const init = () => {
			if (current.readyState < current.HAVE_FUTURE_DATA) {
				blockMedia(
					`readyState is ${current.readyState}, which is less than HAVE_FUTURE_DATA`,
				);

				// Needed by iOS Safari which will not load by default
				// and therefore not fire the canplay event.

				// Be cautious about using `current.load()` as it will
				// reset if a video is already playing.
				// Therefore only calling it after checking if the video
				// has no future data.

				// Breaks on Firefox though: https://github.com/remotion-dev/remotion/issues/3915
				if (!navigator.userAgent.includes('Firefox/')) {
					playbackLogging({
						logLevel,
						message: `Calling .load() on ${src} because readyState is ${current.readyState} and it is not Firefox. ${current.playbackRate}`,
						tag: 'load',
						mountTime,
					});

					const previousPlaybackRate = current.playbackRate;
					current.load();
					current.playbackRate = previousPlaybackRate;
				}
			} else {
				const onWaiting = () => {
					blockMedia('"waiting" event was fired');
				};

				current.addEventListener('waiting', onWaiting);
				cleanupFns.push(() => {
					current.removeEventListener('waiting', onWaiting);
				});
			}
		};

		init();

		return () => {
			cleanup('element was unmounted or prop changed');
		};

		// dependencies array:
		// `src` should be in it, because if changing the source and pausing at the same time,
		// it gives the chance to load the new source.

		// https://github.com/remotion-dev/remotion/issues/5218
	}, [
		buffer,
		src,
		element,
		isPremounting,
		isPostmounting,
		logLevel,
		shouldBuffer,
		mountTime,
	]);

	return isBuffering;
};
