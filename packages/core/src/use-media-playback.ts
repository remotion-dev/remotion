import type {RefObject} from 'react';
import {useContext, useEffect} from 'react';
import {useMediaStartsAt} from './audio/use-audio-frame.js';
import {playAndHandleNotAllowedError} from './play-and-handle-not-allowed-error.js';
import {
	TimelineContext,
	usePlayingState,
	useTimelinePosition,
} from './timeline-position-state.js';
import {useCurrentFrame} from './use-current-frame.js';
import {useVideoConfig} from './use-video-config.js';
import {getMediaTime} from './video/get-current-time.js';
import {isIosSafari} from './video/video-fragment.js';
import {warnAboutNonSeekableMedia} from './warn-about-non-seekable-media.js';

export const DEFAULT_ACCEPTABLE_TIMESHIFT = 0.45;

const seek = (
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement>,
	time: number,
) => {
	if (!mediaRef.current) {
		return;
	}

	// iOS seeking does not support multiple decimals
	if (isIosSafari()) {
		mediaRef.current.currentTime = Number(time.toFixed(1));
		return;
	}

	mediaRef.current.currentTime = time;
};

export const useMediaPlayback = ({
	mediaRef,
	src,
	mediaType,
	playbackRate: localPlaybackRate,
	onlyWarnForMediaSeekingError,
	acceptableTimeshift,
}: {
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement>;
	src: string | undefined;
	mediaType: 'audio' | 'video';
	playbackRate: number;
	onlyWarnForMediaSeekingError: boolean;
	acceptableTimeshift: number;
}) => {
	const {playbackRate: globalPlaybackRate} = useContext(TimelineContext);
	const frame = useCurrentFrame();
	const absoluteFrame = useTimelinePosition();
	const [playing] = usePlayingState();
	const {fps} = useVideoConfig();
	const mediaStartsAt = useMediaStartsAt();

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
		}
	}, [mediaRef, mediaType, playing]);

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
		const timeShift = Math.abs(shouldBeTime - isTime);

		if (timeShift > acceptableTimeShiftButLessThanDuration) {
			// If scrubbing around, adjust timing
			// or if time shift is bigger than 0.45sec

			seek(mediaRef, shouldBeTime);
			if (!onlyWarnForMediaSeekingError) {
				warnAboutNonSeekableMedia(
					mediaRef.current,
					onlyWarnForMediaSeekingError ? 'console-warning' : 'console-error',
				);
			}

			return;
		}

		// Only perform a seek if the time is not already the same.
		// Chrome rounds to 6 digits, so 0.033333333 -> 0.033333,
		// therefore a threshold is allowed.
		// Refer to the https://github.com/remotion-dev/video-buffering-example
		// which is fixed by only seeking conditionally.
		const makesSenseToSeek =
			Math.abs(mediaRef.current.currentTime - shouldBeTime) > 0.00001;

		if (!playing || absoluteFrame === 0) {
			if (makesSenseToSeek) {
				seek(mediaRef, shouldBeTime);
			}
		}

		if (mediaRef.current.paused && !mediaRef.current.ended && playing) {
			if (makesSenseToSeek) {
				seek(mediaRef, shouldBeTime);
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
		playing,
		src,
		mediaStartsAt,
		localPlaybackRate,
		onlyWarnForMediaSeekingError,
		acceptableTimeshift,
		acceptableTimeShiftButLessThanDuration,
	]);
};
