import type {RefObject} from 'react';
import {useEffect, useRef} from 'react';

export const useRequestVideoCallbackTime = ({
	mediaRef,
	mediaType,
	lastSeek,
	onVariableFpsVideoDetected,
}: {
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement | null>;
	mediaType: 'video' | 'audio';
	lastSeek: React.RefObject<number | null>;
	onVariableFpsVideoDetected: () => void;
}) => {
	const currentTime = useRef<{
		time: number;
		lastUpdate: number;
	} | null>(null);

	useEffect(() => {
		const {current} = mediaRef;
		if (current) {
			currentTime.current = {
				time: current.currentTime,
				lastUpdate: performance.now(),
			};
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

		// Right after a seek, frames from before it can still be presented,
		// carrying the old mediaTime. Trusting them would look like a shift by
		// the whole seek and cause another seek.
		let lastSeekAt: number | null = null;
		const onSeeking = () => {
			lastSeekAt = performance.now();
			currentTime.current = null;
		};

		videoTag.addEventListener('seeking', onSeeking);

		const request = () => {
			if (!videoTag) {
				return;
			}

			const cb = videoTag.requestVideoFrameCallback((_, info) => {
				if (lastSeekAt !== null && info.presentationTime < lastSeekAt) {
					request();
					return;
				}

				if (currentTime.current !== null) {
					const difference = Math.abs(
						currentTime.current.time - info.mediaTime,
					);
					const differenceToLastSeek = Math.abs(
						lastSeek.current === null
							? Infinity
							: info.mediaTime - lastSeek.current,
					);
					// If a video suddenly jumps to a position much further than previously
					// and there was no relevant seek
					// Case to be seen with 66a4a49b0862333a56c7d03c.mp4 and autoPlay and pauseWhenBuffering

					if (
						difference > 0.5 &&
						differenceToLastSeek > 0.5 &&
						info.mediaTime > currentTime.current.time
					) {
						onVariableFpsVideoDetected();
					}
				}

				currentTime.current = {
					time: info.mediaTime,
					lastUpdate: performance.now(),
				};
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
			videoTag.removeEventListener('seeking', onSeeking);
		};
	}, [lastSeek, mediaRef, mediaType, onVariableFpsVideoDetected]);

	return currentTime;
};
