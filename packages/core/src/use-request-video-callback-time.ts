import type {RefObject} from 'react';
import {useEffect, useRef} from 'react';

export const useRequestVideoCallbackTime = (
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement>,
	mediaType: 'video' | 'audio',
) => {
	const currentTime = useRef<number | null>(null);

	useEffect(() => {
		const {current} = mediaRef;
		if (current) {
			currentTime.current = current.currentTime;
		} else {
			currentTime.current = null;
			return;
		}

		if (mediaType !== 'video') {
			currentTime.current = null;
			return;
		}

		const videoTag = current as HTMLVideoElement;

		if (!videoTag.requestVideoFrameCallback) {
			return;
		}

		let cancel = () => undefined;

		const request = () => {
			if (!videoTag) {
				return;
			}

			const cb = videoTag.requestVideoFrameCallback((_, info) => {
				currentTime.current = info.mediaTime;
				request();
			});

			cancel = () => {
				videoTag.cancelVideoFrameCallback(cb);
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
