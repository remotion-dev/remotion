import {useEffect} from 'react';
import {useBuffer} from './use-buffer';

export const useMediaBuffering = (
	element: HTMLVideoElement | HTMLAudioElement,
) => {
	const buffer = useBuffer();

	useEffect(() => {
		let cleanup: () => void;

		const onWaiting = () => {
			const {unblock} = buffer.delayPlayback();
			const onCanPlay = () => {
				unblock();
			};

			element.addEventListener('canplay', onCanPlay, {
				once: true,
			});

			cleanup = () => {
				element.removeEventListener('canplay', onCanPlay);
			};
		};

		element.addEventListener('waiting', onWaiting);

		return () => {
			cleanup();
		};
	}, [buffer, element]);
};
