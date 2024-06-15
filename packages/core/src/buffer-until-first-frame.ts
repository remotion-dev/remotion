import {useCallback, useMemo, useRef} from 'react';
import {useBufferState} from './use-buffer-state';

export const useBufferUntilFirstFrame = ({
	mediaRef,
	mediaType,
}: {
	mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement>;
	mediaType: 'video' | 'audio';
}) => {
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

		const unblock = () => {
			playback.unblock();
			current.removeEventListener('ended', unblock, {
				// @ts-expect-error
				once: true,
			});
			current.removeEventListener('pause', unblock, {
				// @ts-expect-error
				once: true,
			});
			bufferingRef.current = false;
		};

		const onEndedOrPause = () => {
			unblock();
		};

		current.requestVideoFrameCallback(() => {
			// Safari often seeks and then stalls.
			// This makes sure that the video actually starts playing.
			current.requestVideoFrameCallback(() => {
				unblock();
			});
		});

		current.addEventListener('ended', onEndedOrPause, {once: true});
		current.addEventListener('pause', onEndedOrPause, {once: true});
	}, [delayPlayback, mediaRef, mediaType]);

	return useMemo(() => {
		return {
			isBuffering: () => bufferingRef.current,
			bufferUntilFirstFrame,
		};
	}, [bufferUntilFirstFrame]);
};
