import {useCallback, useMemo, useRef} from 'react';
import {useLogLevel, useMountTime} from './log-level-context';
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
}: {
	mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>;
	mediaType: 'video' | 'audio';
	onVariableFpsVideoDetected: () => void;
	pauseWhenBuffering: boolean;
}) => {
	const bufferingRef = useRef<boolean>(false);
	const {delayPlayback} = useBufferState();
	const logLevel = useLogLevel();
	const mountTime = useMountTime();
	const loggingRef = useRef({logLevel, mountTime});
	loggingRef.current = {logLevel, mountTime};

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
					logLevel: loggingRef.current.logLevel,
					message: `Not using buffer until first frame, because readyState is ${current.readyState} and is not Safari or Desktop Chrome`,
					mountTime: loggingRef.current.mountTime,
					tag: 'buffer',
				});
				return;
			}

			if (!current.requestVideoFrameCallback) {
				playbackLogging({
					logLevel: loggingRef.current.logLevel,
					message: `Not using buffer until first frame, because requestVideoFrameCallback is not supported`,
					mountTime: loggingRef.current.mountTime,
					tag: 'buffer',
				});
				return;
			}

			bufferingRef.current = true;

			playbackLogging({
				logLevel: loggingRef.current.logLevel,
				message: `Buffering ${mediaRef.current?.src} until the first frame is received`,
				mountTime: loggingRef.current.mountTime,
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
