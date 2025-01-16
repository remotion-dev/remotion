import type React from 'react';
import {useEffect, useState} from 'react';
import type {LogLevel} from './log';
import {Log} from './log';
import {useBufferState} from './use-buffer-state';

export const useMediaBuffering = ({
	element,
	shouldBuffer,
	isPremounting,
	logLevel,
}: {
	element: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>;
	shouldBuffer: boolean;
	isPremounting: boolean;
	logLevel: LogLevel;
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

		if (isPremounting) {
			// Needed by iOS Safari which will not load by default
			// and therefore not fire the canplay event.

			// Be cautious about using `current.load()` as it will
			// reset if a video is already playing.
			// Therefore only calling it after checking if the video
			// has no future data.

			// Breaks on Firefox though: https://github.com/remotion-dev/remotion/issues/3915
			if (current.readyState < current.HAVE_FUTURE_DATA) {
				if (!navigator.userAgent.includes('Firefox/')) {
					Log.trace(
						logLevel,
						`[load] Calling .load() on ${current.src} because readyState is ${current.readyState} and it is not Firefox. Element is premounted`,
					);
					current.load();
				}
			}

			return;
		}

		const cleanup = (reason: string) => {
			cleanupFns.forEach((fn) => fn(reason));
			cleanupFns = [];
			setIsBuffering(false);
		};

		const blockMedia = (reason: string) => {
			setIsBuffering(true);
			Log.trace(
				logLevel,
				`[buffer] buffering ${current.src}. reason = ${reason}`,
			);
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
				Log.trace(
					logLevel,
					`unblocking ${current.src} from buffer. reason = ${cleanupReason}`,
				);
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
					Log.trace(
						logLevel,
						`[load] Calling .load() on ${current.src} because readyState is ${current.readyState} and it is not Firefox.`,
					);

					current.load();
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
	}, [buffer, element, isPremounting, logLevel, shouldBuffer]);

	return isBuffering;
};
