import type {RefObject} from 'react';
import {useEffect, useRef} from 'react';

export const useRequestVideoCallbackTime = (
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement>,
	mediaType: 'video' | 'audio',
) => {
	const currentTime = useRef<number | null>(null);

	useEffect(() => {
		if (mediaRef.current) {
			currentTime.current = mediaRef.current.currentTime;
		} else {
			currentTime.current = null;
		}

		if (mediaType !== 'video') {
			currentTime.current = null;
		}

		let cancel = () => undefined;

		const request = () => {
			const cb = (
				mediaRef.current as HTMLVideoElement
			).requestVideoFrameCallback((_, info) => {
				console.log(info);
				currentTime.current = info.mediaTime;
				request();
			});

			cancel = () => {
				(mediaRef.current as HTMLVideoElement)?.cancelVideoFrameCallback(cb);
				cancel = () => undefined;
			};
		};

		request();

		return () => {
			cancel();
		};
	}, [mediaRef, mediaType]);

	return currentTime;
};
