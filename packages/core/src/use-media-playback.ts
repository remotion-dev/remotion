import type {RefObject} from 'react';
import {useContext, useEffect, useRef} from 'react';
import {useMediaStartsAt} from './audio/use-audio-frame.js';
import {BufferingContextReact} from './buffering.js';
import {playAndHandleNotAllowedError} from './play-and-handle-not-allowed-error.js';
import {
	TimelineContext,
	usePlayingState,
	useTimelinePosition,
} from './timeline-position-state.js';
import {useBufferState} from './use-buffer-state.js';
import {useCurrentFrame} from './use-current-frame.js';
import {useMediaBuffering} from './use-media-buffering.js';
import {useVideoConfig} from './use-video-config.js';
import {getMediaTime} from './video/get-current-time.js';
import {isIosSafari} from './video/video-fragment.js';
import {warnAboutNonSeekableMedia} from './warn-about-non-seekable-media.js';

export const DEFAULT_ACCEPTABLE_TIMESHIFT = 0.45;

const seek = (
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement>,
	time: number,
	type: 'video' | 'audio',
	playing: boolean,
): Promise<number | null> => {
	if (!mediaRef.current) {
		return Promise.resolve(null);
	}

	console.log('gonna seek', playing);

	const returnPromise = () => {
		if (
			type === 'video' &&
			(mediaRef.current as HTMLVideoElement).requestVideoFrameCallback
		) {
			return new Promise<number>((resolve) => {
				(mediaRef.current as HTMLVideoElement).requestVideoFrameCallback(
					(_, i) => {
						resolve(i.mediaTime);
					},
				);
			});
		}

		return Promise.resolve(null);
	};

	// iOS seeking does not support multiple decimals
	if (isIosSafari()) {
		mediaRef.current.currentTime = Number(time.toFixed(1));
		if (
			type === 'video' &&
			(mediaRef.current as HTMLVideoElement).requestVideoFrameCallback
		) {
			return returnPromise();
		}

		return Promise.resolve(null);
	}

	mediaRef.current.currentTime = time;
	return returnPromise();
};

export const useMediaPlayback = ({
	mediaRef,
	src,
	mediaType,
	playbackRate: localPlaybackRate,
	onlyWarnForMediaSeekingError,
	acceptableTimeshift,
	pauseWhenBuffering,
	isPremounting,
}: {
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement>;
	src: string | undefined;
	mediaType: 'audio' | 'video';
	playbackRate: number;
	onlyWarnForMediaSeekingError: boolean;
	acceptableTimeshift: number;
	pauseWhenBuffering: boolean;
	isPremounting: boolean;
}) => {
	const {playbackRate: globalPlaybackRate} = useContext(TimelineContext);
	const frame = useCurrentFrame();
	const absoluteFrame = useTimelinePosition();
	const [playing] = usePlayingState();
	const buffering = useContext(BufferingContextReact);
	const {fps} = useVideoConfig();
	const mediaStartsAt = useMediaStartsAt();
	const {delayPlayback} = useBufferState();

	if (!buffering) {
		throw new Error(
			'useMediaPlayback must be used inside a <BufferingContext>',
		);
	}

	const isMediaTagBuffering = useMediaBuffering({
		element: mediaRef,
		shouldBuffer: pauseWhenBuffering,
		isPremounting,
	});

	const playbackRate = localPlaybackRate * globalPlaybackRate;

	// For short audio, a lower acceptable time shift is used
	const acceptableTimeShiftButLessThanDuration = (() => {
		if (mediaRef.current?.duration) {
			return Math.min(
				mediaRef.current.duration,
				acceptableTimeshift ?? DEFAULT_ACCEPTABLE_TIMESHIFT,
			);
		}

		return acceptableTimeshift;
	})();

	useEffect(() => {
		if (!playing) {
			mediaRef.current?.pause();
			return;
		}

		const isPlayerBuffering = buffering.buffering.current;
		if (isPlayerBuffering && !isMediaTagBuffering) {
			mediaRef.current?.pause();
		}
	}, [buffering.buffering, isMediaTagBuffering, mediaRef, playing]);

	const currentTime = useRef<number | null>(null);

	useEffect(() => {
		if (!mediaRef.current) {
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

	useEffect(() => {
		const tagName = mediaType === 'audio' ? '<Audio>' : '<Video>';
		if (!mediaRef.current) {
			throw new Error(`No ${mediaType} ref found`);
		}

		if (!src) {
			throw new Error(
				`No 'src' attribute was passed to the ${tagName} element.`,
			);
		}

		const playbackRateToSet = Math.max(0, playbackRate);
		if (mediaRef.current.playbackRate !== playbackRateToSet) {
			mediaRef.current.playbackRate = playbackRateToSet;
		}

		const desiredUnclampedTime = getMediaTime({
			frame,
			playbackRate: localPlaybackRate,
			startFrom: -mediaStartsAt,
			fps,
		});
		const {duration} = mediaRef.current;
		const shouldBeTime =
			!Number.isNaN(duration) && Number.isFinite(duration)
				? Math.min(duration, desiredUnclampedTime)
				: desiredUnclampedTime;
		const isTime = mediaRef.current.currentTime;
		const rvcTime = currentTime.current ?? Infinity;

		const timeShiftMediaTag = Math.abs(shouldBeTime - isTime);
		const timeShiftRvcTag = Math.abs(shouldBeTime - rvcTime);
		const timeShift = Math.min(timeShiftMediaTag, timeShiftRvcTag);

		console.log({
			isTime,
			rvcTime,
			shouldBeTime,
			state: mediaRef.current.readyState,
			playing: !mediaRef.current.paused,
		});

		if (timeShift > acceptableTimeShiftButLessThanDuration) {
			// If scrubbing around, adjust timing
			// or if time shift is bigger than 0.45sec

			console.log('Seeking', shouldBeTime, isTime, rvcTime, timeShift);
			const {unblock} = delayPlayback();
			seek(mediaRef, shouldBeTime, mediaType, playing).then((num) => {
				console.log('seeking done unblock', num);
				unblock();
			});

			if (!onlyWarnForMediaSeekingError) {
				warnAboutNonSeekableMedia(
					mediaRef.current,
					onlyWarnForMediaSeekingError ? 'console-warning' : 'console-error',
				);
			}

			return;
		}

		const seekThreshold = playing ? 0.15 : 0.00001;

		if (buffering.buffering.current) {
			const shouldSeek =
				Math.abs(mediaRef.current.currentTime - shouldBeTime) > seekThreshold;
			if (shouldSeek) {
				seek(mediaRef, shouldBeTime, mediaType, playing).then(() => {
					console.log('seeking done (buffered)');
				});
			}

			return;
		}

		// Only perform a seek if the time is not already the same.
		// Chrome rounds to 6 digits, so 0.033333333 -> 0.033333,
		// therefore a threshold is allowed.
		// Refer to the https://github.com/remotion-dev/video-buffering-example
		// which is fixed by only seeking conditionally.
		const makesSenseToSeek =
			Math.abs(mediaRef.current.currentTime - shouldBeTime) > seekThreshold;

		if (!playing) {
			if (makesSenseToSeek) {
				seek(mediaRef, shouldBeTime, mediaType, playing).then(() => {});
			}

			return;
		}

		// We assured we are in playing state
		if (
			(mediaRef.current.paused && !mediaRef.current.ended) ||
			absoluteFrame === 0
		) {
			if (makesSenseToSeek) {
				console.log('playing', mediaRef.current.currentTime, shouldBeTime);
				seek(mediaRef, shouldBeTime, mediaType, playing).then(() => {
					console.log('seeking done (playing)');
				});
			}

			playAndHandleNotAllowedError(mediaRef, mediaType);
		}
	}, [
		absoluteFrame,
		fps,
		playbackRate,
		frame,
		mediaRef,
		mediaType,
		src,
		mediaStartsAt,
		localPlaybackRate,
		onlyWarnForMediaSeekingError,
		acceptableTimeshift,
		acceptableTimeShiftButLessThanDuration,
		playing,
		delayPlayback,
		buffering.buffering,
	]);
};
