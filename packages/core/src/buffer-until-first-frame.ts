import {useCallback, useMemo, useRef} from 'react';
import {useBufferState} from './use-buffer-state';

export const useBufferUntilFirstFrame = ({
	mediaRef,
	mediaType,
	onVariableFpsVideoDetected,
	pauseWhenBuffering,
	currentTime,
}: {
	mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement>;
	mediaType: 'video' | 'audio';
	onVariableFpsVideoDetected: () => void;
	pauseWhenBuffering: boolean;
	currentTime: React.MutableRefObject<number | null>;
}) => {
	const bufferingRef = useRef<boolean>(false);
	const {delayPlayback} = useBufferState();

	const bufferUntilFirstFrame = useCallback(
		(requestedTime: number) => {
			if (mediaType !== 'video') {
				return;
			}

			if (!pauseWhenBuffering) {
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

			current.requestVideoFrameCallback((_, info) => {
				const differenceFromRequested = Math.abs(
					info.mediaTime - requestedTime,
				);
				if (differenceFromRequested > 0.5) {
					onVariableFpsVideoDetected();
				}

				// Safari often seeks and then stalls.
				// This makes sure that the video actually starts playing.
				current.requestVideoFrameCallback(() => {
					unblock();
				});
			});

			current.addEventListener('ended', onEndedOrPause, {once: true});
			current.addEventListener('pause', onEndedOrPause, {once: true});
		},
		[
			delayPlayback,
			mediaRef,
			mediaType,
			onVariableFpsVideoDetected,
			pauseWhenBuffering,
		],
	);

	return useMemo(() => {
		return {
			isBuffering: () => bufferingRef.current,
			bufferUntilFirstFrame,
		};
	}, [bufferUntilFirstFrame]);
};
