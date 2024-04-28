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
			};

			const onError = () => {
				unblock();
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
				unblock();
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
	}, [buffer, element, isPremounting, shouldBuffer]);
};
