import type React from 'react';
import {useEffect} from 'react';
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

	useEffect(() => {
		let cleanup = () => undefined;

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

		const onWaiting = () => {
			const {unblock} = buffer.delayPlayback();
			const onCanPlay = () => {
				unblock();
				cleanup();
				// eslint-disable-next-line @typescript-eslint/no-use-before-define
				init();
			};

			const onError = () => {
				unblock();
				cleanup();
				// eslint-disable-next-line @typescript-eslint/no-use-before-define
				init();
			};

			current.addEventListener('canplay', onCanPlay, {
				once: true,
			});

			current.addEventListener('error', onError, {
				once: true,
			});

			cleanup = () => {
				current.removeEventListener('canplay', onCanPlay);
				current.removeEventListener('error', onError);
				current.removeEventListener('waiting', onWaiting);
				unblock();
				return undefined;
			};
		};

		const init = () => {
			if (current.readyState < current.HAVE_FUTURE_DATA) {
				onWaiting();
			} else {
				current.addEventListener('waiting', onWaiting);
			}
		};

		init();

		return () => {
			current.removeEventListener('waiting', onWaiting);

			cleanup();
		};
	}, [buffer, element, isPremounting, shouldBuffer]);
};
