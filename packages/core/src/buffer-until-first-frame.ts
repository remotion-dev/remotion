import {useCallback, useRef} from 'react';
import {useBufferState} from './use-buffer-state';

export const useBufferUntilFirstFrame = (
	mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement>,
	mediaType: 'video' | 'audio',
) => {
	const bufferingRef = useRef<boolean>(false);
	const {delayPlayback} = useBufferState();

	const bufferUntilFirstFrame = useCallback(() => {
		if (mediaType !== 'video') {
			return;
		}

		const current = mediaRef.current as HTMLVideoElement | null;

		if (!current) {
			return;
		}

		if (!current.requestVideoFrameCallback) {
			return;
		}

		bufferingRef.current = true;

		const playback = delayPlayback();
		current.requestVideoFrameCallback(() => {
			bufferingRef.current = false;
			playback.unblock();
		});
	}, [delayPlayback, mediaRef, mediaType]);

	return {
		isBuffering: () => bufferingRef.current,
		bufferUntilFirstFrame,
	};
};
