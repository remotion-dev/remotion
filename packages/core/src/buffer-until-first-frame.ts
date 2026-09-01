import {useCallback, useMemo, useRef} from 'react';
import {useBufferState} from './use-buffer-state';
import {useLogger} from './use-logger.js';

const isSafariWebkit = () => {
	const isSafari = /^((?!chrome|android).)*safari/i.test(
		window.navigator.userAgent,
	);
	return isSafari;
};

export const useBufferUntilFirstFrame = ({
	mediaRef,
	mediaType,
	onVariableFpsVideoDetected,
	pauseWhenBuffering,
}: {
	mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>;
	mediaType: 'video' | 'audio';
	onVariableFpsVideoDetected: () => void;
	pauseWhenBuffering: boolean;
}) => {
	const bufferingRef = useRef<boolean>(false);
	const {delayPlayback} = useBufferState();
	const logger = useLogger();

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

			if (current.readyState >= current.HAVE_FUTURE_DATA && !isSafariWebkit()) {
				logger.playback(
					'buffer',
					`Not using buffer until first frame, because readyState is ${current.readyState} and is not Safari or Desktop Chrome`,
				);
				return;
			}

			if (!current.requestVideoFrameCallback) {
				logger.playback(
					'buffer',
					'Not using buffer until first frame, because requestVideoFrameCallback is not supported',
				);
				return;
			}

			bufferingRef.current = true;

			logger.playback(
				'buffer',
				`Buffering ${mediaRef.current?.src} until the first frame is received`,
			);

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

			const onEndedOrPauseOrCanPlay = () => {
				unblock();
			};

			current.requestVideoFrameCallback((_, info) => {
				const differenceFromRequested = Math.abs(
					info.mediaTime - requestedTime,
				);
				if (differenceFromRequested > 0.5) {
					onVariableFpsVideoDetected();
				}

				unblock();
			});

			current.addEventListener('ended', onEndedOrPauseOrCanPlay, {once: true});
			current.addEventListener('pause', onEndedOrPauseOrCanPlay, {once: true});
			current.addEventListener('canplay', onEndedOrPauseOrCanPlay, {
				once: true,
			});
		},
		// The logger has stable identity and reads the latest context.
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
