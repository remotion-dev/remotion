import type React from 'react';
import {useEffect} from 'react';
import {useBufferState} from './use-buffer';

export const useMediaBuffering = (
	element: React.RefObject<HTMLVideoElement | HTMLAudioElement>,
	shouldBuffer: boolean,
) => {
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

		const onWaiting = () => {
			const {unblock} = buffer.delayPlayback();
			const onCanPlay = () => {
				unblock();
			};

			current.addEventListener('canplay', onCanPlay, {
				once: true,
			});

			cleanup = () => {
				current.removeEventListener('canplay', onCanPlay);
				return undefined;
			};
		};

		if (current.readyState < current.HAVE_FUTURE_DATA) {
			onWaiting();
		} else {
			current.addEventListener('waiting', onWaiting);
		}

		return () => {
			cleanup();
		};
	}, [buffer, element, shouldBuffer]);
};
