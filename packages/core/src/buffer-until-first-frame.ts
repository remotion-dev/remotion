import {useCallback, useMemo, useRef} from 'react';
import type {LogLevel} from './log';
import {playbackLogging} from './playback-logging';
import {useBufferState} from './use-buffer-state';

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
	logLevel,
	mountTime,
}: {
	mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>;
	mediaType: 'video' | 'audio';
	onVariableFpsVideoDetected: () => void;
	pauseWhenBuffering: boolean;
	logLevel: LogLevel;
	mountTime: number | null;
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

			if (current.readyState >= current.HAVE_FUTURE_DATA && !isSafariWebkit()) {
				playbackLogging({
					logLevel,
					message: `Not using buffer until first frame, because readyState is ${current.readyState} and is not Safari or Desktop Chrome`,
					mountTime,
					tag: 'buffer',
				});
				return;
			}

			if (!current.requestVideoFrameCallback) {
				playbackLogging({
					logLevel,
					message: `Not using buffer until first frame, because requestVideoFrameCallback is not supported`,
					mountTime,
					tag: 'buffer',
				});
				return;
			}

			bufferingRef.current = true;

			playbackLogging({
				logLevel,
				message: `Buffering ${mediaRef.current?.src} until the first frame is received`,
				mountTime,
				tag: 'buffer',
			});

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
		[
			delayPlayback,
			logLevel,
			mediaRef,
			mediaType,
			mountTime,
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
