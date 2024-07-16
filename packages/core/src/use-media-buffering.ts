import type React from 'react';
import {useEffect, useState} from 'react';
import {useBufferState} from './use-buffer-state';

export const useMediaBuffering = ({
	element,
	shouldBuffer,
	isPremounting,
}: {
	element: React.RefObject<HTMLVideoElement | HTMLAudioElement>;
	shouldBuffer: boolean;
	isPremounting: boolean;
}) => {
	const buffer = useBufferState();
	const [isBuffering, setIsBuffering] = useState(false);

	// Buffer state based on `waiting` and `canplay`
	useEffect(() => {
		let cleanupFns: Function[] = [];

		const {current} = element;
		if (!current) {
			return;
		}

		if (!shouldBuffer) {
			return;
		}

		if (isPremounting) {
			return;
		}

		const cleanup = () => {
			cleanupFns.forEach((fn) => fn());
			cleanupFns = [];
			setIsBuffering(false);
		};

		const onWaiting = () => {
			setIsBuffering(true);
			const {unblock} = buffer.delayPlayback();
			const onCanPlay = () => {
				cleanup();
				// eslint-disable-next-line @typescript-eslint/no-use-before-define
				init();
			};

			const onError = () => {
				cleanup();
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
			cleanupFns.push(() => {
				unblock();
			});
		};

		const init = () => {
			if (current.readyState < current.HAVE_FUTURE_DATA) {
				onWaiting();

				// Needed by iOS Safari which will not load by default
				// and therefore not fire the canplay event.

				// Be cautious about using `current.load()` as it will
				// reset if a video is already playing.
				// Therefore only calling it after checking if the video
				// has no future data.

				// Breaks on Firefox though: https://github.com/remotion-dev/remotion/issues/3915
				if (!navigator.userAgent.includes('Firefox/')) {
					current.load();
				}
			} else {
				current.addEventListener('waiting', onWaiting);
				cleanupFns.push(() => {
					current.removeEventListener('waiting', onWaiting);
				});
			}
		};

		init();

		return () => {
			cleanup();
		};
	}, [buffer, element, isPremounting, shouldBuffer]);

	return isBuffering;
};
