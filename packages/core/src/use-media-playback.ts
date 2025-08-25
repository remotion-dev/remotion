import type {RefObject} from 'react';
import {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
} from 'react';
import {useMediaStartsAt} from './audio/use-audio-frame.js';
import {useBufferUntilFirstFrame} from './buffer-until-first-frame.js';
import {BufferingContextReact, useIsPlayerBuffering} from './buffering.js';
import {useLogLevel, useMountTime} from './log-level-context.js';
import {Log} from './log.js';
import {useCurrentTimeOfMediaTagWithUpdateTimeStamp} from './media-tag-current-time-timestamp.js';
import {playAndHandleNotAllowedError} from './play-and-handle-not-allowed-error.js';
import {playbackLogging} from './playback-logging.js';
import {seek} from './seek.js';
import {
	TimelineContext,
	usePlayingState,
	useTimelinePosition,
} from './timeline-position-state.js';
import {useCurrentFrame} from './use-current-frame.js';
import {useMediaBuffering} from './use-media-buffering.js';
import {useRequestVideoCallbackTime} from './use-request-video-callback-time.js';
import {useVideoConfig} from './use-video-config.js';
import {getMediaTime} from './video/get-current-time.js';
import {warnAboutNonSeekableMedia} from './warn-about-non-seekable-media.js';

export const useMediaPlayback = ({
	mediaRef,
	src,
	mediaType,
	playbackRate: localPlaybackRate,
	onlyWarnForMediaSeekingError,
	acceptableTimeshift,
	pauseWhenBuffering,
	isPremounting,
	isPostmounting,
	onAutoPlayError,
}: {
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement | null>;
	src: string | undefined;
	mediaType: 'audio' | 'video';
	playbackRate: number;
	onlyWarnForMediaSeekingError: boolean;
	acceptableTimeshift: number | null;
	pauseWhenBuffering: boolean;
	isPremounting: boolean;
	isPostmounting: boolean;
	onAutoPlayError: null | (() => void);
}) => {
	const {playbackRate: globalPlaybackRate} = useContext(TimelineContext);
	const frame = useCurrentFrame();
	const absoluteFrame = useTimelinePosition();
	const [playing] = usePlayingState();
	const buffering = useContext(BufferingContextReact);
	const {fps} = useVideoConfig();
	const mediaStartsAt = useMediaStartsAt();
	const lastSeekDueToShift = useRef<number | null>(null);
	const lastSeek = useRef<number | null>(null);
	const logLevel = useLogLevel();
	const mountTime = useMountTime();

	if (!buffering) {
		throw new Error(
			'useMediaPlayback must be used inside a <BufferingContext>',
		);
	}

	const isVariableFpsVideoMap = useRef<Record<string, boolean>>({});

	const onVariableFpsVideoDetected = useCallback(() => {
		if (!src) {
			return;
		}

		if (isVariableFpsVideoMap.current[src]) {
			return;
		}

		Log.verbose(
			logLevel,
			`Detected ${src} as a variable FPS video. Disabling buffering while seeking.`,
		);

		isVariableFpsVideoMap.current[src] = true;
	}, [logLevel, src]);

	const rvcCurrentTime = useRequestVideoCallbackTime({
		mediaRef,
		mediaType,
		lastSeek,
		onVariableFpsVideoDetected,
	});

	const mediaTagCurrentTime =
		useCurrentTimeOfMediaTagWithUpdateTimeStamp(mediaRef);

	const desiredUnclampedTime = getMediaTime({
		frame,
		playbackRate: localPlaybackRate,
		startFrom: -mediaStartsAt,
		fps,
	});

	const isMediaTagBuffering = useMediaBuffering({
		element: mediaRef,
		shouldBuffer: pauseWhenBuffering,
		isPremounting,
		isPostmounting,
		logLevel,
		mountTime,
		src: src ?? null,
	});

	const {bufferUntilFirstFrame, isBuffering} = useBufferUntilFirstFrame({
		mediaRef,
		mediaType,
		onVariableFpsVideoDetected,
		pauseWhenBuffering,
		logLevel,
		mountTime,
	});

	const playbackRate = localPlaybackRate * globalPlaybackRate;

	const acceptableTimeShiftButLessThanDuration = (() => {
		// In Safari, it seems to lag behind mostly around ~0.4 seconds
		const DEFAULT_ACCEPTABLE_TIMESHIFT_WITH_NORMAL_PLAYBACK = 0.45;

		// If there is amplification, the acceptable timeshift is higher
		const DEFAULT_ACCEPTABLE_TIMESHIFT_WITH_AMPLIFICATION =
			DEFAULT_ACCEPTABLE_TIMESHIFT_WITH_NORMAL_PLAYBACK + 0.2;

		const defaultAcceptableTimeshift =
			DEFAULT_ACCEPTABLE_TIMESHIFT_WITH_AMPLIFICATION;
		// For short audio, a lower acceptable time shift is used
		if (mediaRef.current?.duration) {
			return Math.min(
				mediaRef.current.duration,
				acceptableTimeshift ?? defaultAcceptableTimeshift,
			);
		}

		return acceptableTimeshift ?? defaultAcceptableTimeshift;
	})();

	const isPlayerBuffering = useIsPlayerBuffering(buffering);

	useEffect(() => {
		if (mediaRef.current?.paused) {
			return;
		}

		if (!playing) {
			playbackLogging({
				logLevel,
				tag: 'pause',
				message: `Pausing ${mediaRef.current?.src} because ${isPremounting ? 'media is premounting' : isPostmounting ? 'media is postmounting' : 'Player is not playing'}`,
				mountTime,
			});
			mediaRef.current?.pause();
			return;
		}

		const isMediaTagBufferingOrStalled = isMediaTagBuffering || isBuffering();

		const playerBufferingNotStateButLive = buffering.buffering.current;
		if (playerBufferingNotStateButLive && !isMediaTagBufferingOrStalled) {
			playbackLogging({
				logLevel,
				tag: 'pause',
				message: `Pausing ${mediaRef.current?.src} because player is buffering but media tag is not`,
				mountTime,
			});
			mediaRef.current?.pause();
		}
	}, [
		isBuffering,
		isMediaTagBuffering,
		buffering,
		isPlayerBuffering,
		isPremounting,
		logLevel,
		mediaRef,
		mediaType,
		mountTime,
		playing,
		isPostmounting,
	]);

	// This must be a useLayoutEffect, because afterwards, useVolume() looks at the playbackRate
	// and it is also in a useLayoutEffect.
	useLayoutEffect(() => {
		const playbackRateToSet = Math.max(0, playbackRate);
		if (
			mediaRef.current &&
			mediaRef.current.playbackRate !== playbackRateToSet
		) {
			mediaRef.current.playbackRate = playbackRateToSet;
		}
	}, [mediaRef, playbackRate]);

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

		const {duration} = mediaRef.current;
		const shouldBeTime =
			!Number.isNaN(duration) && Number.isFinite(duration)
				? Math.min(duration, desiredUnclampedTime)
				: desiredUnclampedTime;

		const mediaTagTime = mediaTagCurrentTime.current.time;
		const rvcTime = rvcCurrentTime.current?.time ?? null;

		const isVariableFpsVideo = isVariableFpsVideoMap.current[src];

		const timeShiftMediaTag = Math.abs(shouldBeTime - mediaTagTime);
		const timeShiftRvcTag = rvcTime ? Math.abs(shouldBeTime - rvcTime) : null;

		const mostRecentTimeshift =
			rvcCurrentTime.current?.lastUpdate &&
			rvcCurrentTime.current.time > mediaTagCurrentTime.current.lastUpdate
				? (timeShiftRvcTag as number)
				: timeShiftMediaTag;

		const timeShift =
			timeShiftRvcTag && !isVariableFpsVideo
				? mostRecentTimeshift
				: timeShiftMediaTag;

		if (
			timeShift > acceptableTimeShiftButLessThanDuration &&
			lastSeekDueToShift.current !== shouldBeTime
		) {
			// If scrubbing around, adjust timing
			// or if time shift is bigger than 0.45sec

			lastSeek.current = seek({
				mediaRef: mediaRef.current,
				time: shouldBeTime,
				logLevel,
				why: `because time shift is too big. shouldBeTime = ${shouldBeTime}, isTime = ${mediaTagTime}, requestVideoCallbackTime = ${rvcTime}, timeShift = ${timeShift}${isVariableFpsVideo ? ', isVariableFpsVideo = true' : ''}, isPremounting = ${isPremounting}, isPostmounting = ${isPostmounting}, pauseWhenBuffering = ${pauseWhenBuffering}`,
				mountTime,
			});
			lastSeekDueToShift.current = lastSeek.current;
			if (playing) {
				if (playbackRate > 0) {
					bufferUntilFirstFrame(shouldBeTime);
				}

				if (mediaRef.current.paused) {
					playAndHandleNotAllowedError({
						mediaRef,
						mediaType,
						onAutoPlayError,
						logLevel,
						mountTime,
						reason:
							'player is playing but media tag is paused, and just seeked',
					});
				}
			}

			if (!onlyWarnForMediaSeekingError) {
				warnAboutNonSeekableMedia(
					mediaRef.current,
					onlyWarnForMediaSeekingError ? 'console-warning' : 'console-error',
				);
			}

			return;
		}

		const seekThreshold = playing ? 0.15 : 0.01;

		// Only perform a seek if the time is not already the same.
		// Chrome rounds to 6 digits, so 0.033333333 -> 0.033333,
		// therefore a threshold is allowed.
		// Refer to the https://github.com/remotion-dev/video-buffering-example
		// which is fixed by only seeking conditionally.
		const makesSenseToSeek =
			Math.abs(mediaRef.current.currentTime - shouldBeTime) > seekThreshold;

		const isMediaTagBufferingOrStalled = isMediaTagBuffering || isBuffering();
		const isSomethingElseBuffering =
			buffering.buffering.current && !isMediaTagBufferingOrStalled;

		if (!playing || isSomethingElseBuffering) {
			if (makesSenseToSeek) {
				lastSeek.current = seek({
					mediaRef: mediaRef.current,
					time: shouldBeTime,
					logLevel,
					why: `not playing or something else is buffering. time offset is over seek threshold (${seekThreshold})`,
					mountTime,
				});
			}

			return;
		}

		if (!playing || buffering.buffering.current) {
			return;
		}

		// We now assured we are in playing state and not buffering
		const pausedCondition = mediaRef.current.paused && !mediaRef.current.ended;
		const firstFrameCondition = absoluteFrame === 0;
		if (pausedCondition || firstFrameCondition) {
			const reason = pausedCondition
				? 'media tag is paused'
				: 'absolute frame is 0';
			if (makesSenseToSeek) {
				lastSeek.current = seek({
					mediaRef: mediaRef.current,
					time: shouldBeTime,
					logLevel,
					why: `is over timeshift threshold (threshold = ${seekThreshold}) and ${reason}`,
					mountTime,
				});
			}

			playAndHandleNotAllowedError({
				mediaRef,
				mediaType,
				onAutoPlayError,
				logLevel,
				mountTime,
				reason: `player is playing and ${reason}`,
			});
			if (!isVariableFpsVideo && playbackRate > 0) {
				bufferUntilFirstFrame(shouldBeTime);
			}
		}
	}, [
		absoluteFrame,
		acceptableTimeShiftButLessThanDuration,
		bufferUntilFirstFrame,
		buffering.buffering,
		rvcCurrentTime,
		logLevel,
		desiredUnclampedTime,
		isBuffering,
		isMediaTagBuffering,
		mediaRef,
		mediaType,
		onlyWarnForMediaSeekingError,
		playbackRate,
		playing,
		src,
		onAutoPlayError,
		isPremounting,
		isPostmounting,
		pauseWhenBuffering,
		mountTime,
		mediaTagCurrentTime,
	]);
};
