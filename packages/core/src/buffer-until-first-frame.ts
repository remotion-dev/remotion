import {useCallback, useRef} from 'react';
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

	const bufferUntilFirstFrame = useCallback(
		({skipIfPaused}: {skipIfPaused: boolean}) => {
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

			if (skipIfPaused && current.paused) {
				console.log('not seeking because paused');
			}

			bufferingRef.current = true;

			const playback = delayPlayback();

			current.requestVideoFrameCallback((_, info2) => {
				console.log('requestVideoFrameCallback', _, info2);
				bufferingRef.current = false;
				playback.unblock();
			});
		},
		[delayPlayback, mediaRef, mediaType],
	);

	return {
		isBuffering: () => bufferingRef.current,
		bufferUntilFirstFrame,
	};
};
