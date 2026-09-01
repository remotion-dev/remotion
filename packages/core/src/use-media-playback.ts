import type {RefObject} from 'react';
import {useCallback, useEffect, useLayoutEffect, useRef} from 'react';
import {useMediaStartsAt} from './audio/use-audio-frame.js';
import {useBufferUntilFirstFrame} from './buffer-until-first-frame.js';
import {getMediaSyncAction} from './get-media-sync-action.js';
import {useLogging} from './log-level-context.js';
import {Log} from './log.js';
import {useCurrentTimeOfMediaTagWithUpdateTimeStamp} from './media-tag-current-time-timestamp.js';
import {usePlayMedia} from './play-media.js';
import {playbackLogging} from './playback-logging.js';
import {useSeek} from './seek.js';
import {
	usePlaying,
	usePlaybackRate,
	useTimelinePosition,
} from './timeline-position-state.js';
import {useBuffering} from './use-buffering.js';
import {useCurrentFrame} from './use-current-frame.js';
import {useMediaBuffering} from './use-media-buffering.js';
import {useRequestVideoCallbackTime} from './use-request-video-callback-time.js';
import {useVideoConfig} from './use-video-config.js';
import {getMediaTime} from './video/get-current-time.js';
import {warnAboutNonSeekableMedia} from './warn-about-non-seekable-media.js';

// In Safari, amplified media can lag behind by around 0.4 seconds.
const DEFAULT_ACCEPTABLE_TIMESHIFT_WITH_AMPLIFICATION = 0.65;

const getPauseReason = ({
	reason,
	isPremounting,
	isPostmounting,
}: {
	reason: 'not-playing' | 'buffering';
	isPremounting: boolean;
	isPostmounting: boolean;
}) => {
	if (reason === 'buffering') {
		return 'player is buffering but media tag is not';
	}

	if (isPremounting) {
		return 'media is premounting';
	}

	if (isPostmounting) {
		return 'media is postmounting';
	}

	return 'Player is not playing';
};

export const useMediaPlayback = ({
	mediaRef,
	src,
	mediaType,
	playbackRate: localPlaybackRate,
	preservePitch = true,
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
	preservePitch: boolean | undefined;
	onlyWarnForMediaSeekingError: boolean;
	acceptableTimeshift: number | null;
	pauseWhenBuffering: boolean;
	isPremounting: boolean;
	isPostmounting: boolean;
	onAutoPlayError: null | (() => void);
}) => {
	const {playbackRate: globalPlaybackRate} = usePlaybackRate();
	const frame = useCurrentFrame();
	const absoluteFrame = useTimelinePosition();
	const playing = usePlaying();
	const playerBuffering = useBuffering();
	const {fps} = useVideoConfig();
	const mediaStartsAt = useMediaStartsAt();
	const lastSeekDueToShift = useRef<number | null>(null);
	const lastSeek = useRef<number | null>(null);
	const logging = useLogging();
	const loggingRef = useRef(logging);
	loggingRef.current = logging;
	const seek = useSeek();
	const playMedia = usePlayMedia();

	const isVariableFpsVideoMap = useRef<Record<string, boolean>>({});

	const onVariableFpsVideoDetected = useCallback(() => {
		if (!src) {
			return;
		}

		if (isVariableFpsVideoMap.current[src]) {
			return;
		}

		Log.verbose(
			{logLevel: loggingRef.current.logLevel, tag: null},
			`Detected ${src} as a variable FPS video. Disabling buffering while seeking.`,
		);

		isVariableFpsVideoMap.current[src] = true;
	}, [src]);

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
		src: src ?? null,
	});

	const {bufferUntilFirstFrame, isBuffering} = useBufferUntilFirstFrame({
		mediaRef,
		mediaType,
		onVariableFpsVideoDetected,
		pauseWhenBuffering,
	});

	const playbackRate = localPlaybackRate * globalPlaybackRate;

	const acceptableTimeShiftButLessThanDuration = (() => {
		// For short audio, a lower acceptable time shift is used
		if (mediaRef.current?.duration) {
			return Math.min(
				mediaRef.current.duration,
				acceptableTimeshift ?? DEFAULT_ACCEPTABLE_TIMESHIFT_WITH_AMPLIFICATION,
			);
		}

		return (
			acceptableTimeshift ?? DEFAULT_ACCEPTABLE_TIMESHIFT_WITH_AMPLIFICATION
		);
	})();

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

		if (mediaRef.current && mediaRef.current.preservesPitch !== preservePitch) {
			mediaRef.current.preservesPitch = preservePitch;
		}
	}, [mediaRef, playbackRate, preservePitch]);

	useEffect(() => {
		const tagName = mediaType === 'audio' ? '<Html5Audio>' : '<Html5Video>';
		if (!mediaRef.current) {
			throw new Error(`No ${mediaType} ref found`);
		}

		if (!src) {
			throw new Error(
				`No 'src' attribute was passed to the ${tagName} element.`,
			);
		}

		const {current} = mediaRef;
		const isMediaTagBufferingOrStalled = isMediaTagBuffering || isBuffering();
		let pauseReason: 'not-playing' | 'buffering' | null = null;
		if (!playing) {
			pauseReason = 'not-playing';
		} else if (playerBuffering && !isMediaTagBufferingOrStalled) {
			pauseReason = 'buffering';
		}

		if (!current.paused && pauseReason !== null) {
			playbackLogging({
				...loggingRef.current,
				tag: 'pause',
				message: `Pausing ${current.src} because ${getPauseReason({
					reason: pauseReason,
					isPremounting,
					isPostmounting,
				})}`,
			});
			current.pause();
		}

		const action = getMediaSyncAction({
			duration: current.duration,
			currentTime: current.currentTime,
			paused: current.paused,
			ended: current.ended,
			desiredUnclampedTime,
			mediaTagTime: mediaTagCurrentTime.current.time,
			mediaTagLastUpdate: mediaTagCurrentTime.current.lastUpdate,
			rvcTime: rvcCurrentTime.current?.time ?? null,
			rvcLastUpdate: rvcCurrentTime.current?.lastUpdate ?? null,
			isVariableFpsVideo: Boolean(isVariableFpsVideoMap.current[src]),
			acceptableTimeShift: acceptableTimeShiftButLessThanDuration,
			lastSeekDueToShift: lastSeekDueToShift.current,
			playing,
			playbackRate,
			mediaTagBufferingOrStalled: isMediaTagBufferingOrStalled,
			playerBuffering,
			absoluteFrame,
			onlyWarnForMediaSeekingError,
			isPremounting,
			isPostmounting,
			pauseWhenBuffering,
		});

		if (action.type === 'none') {
			return;
		}

		if (action.type === 'seek-due-to-shift') {
			lastSeek.current = seek({
				mediaRef: current,
				time: action.shouldBeTime,
				why: action.why,
			});
			lastSeekDueToShift.current = lastSeek.current;

			if (action.bufferUntilFirstFrame) {
				bufferUntilFirstFrame(action.shouldBeTime);
			}

			if (action.playReason !== null) {
				playMedia({
					mediaRef,
					mediaType,
					onAutoPlayError,
					reason: action.playReason,
				});
			}

			if (action.warnAboutNonSeekable) {
				warnAboutNonSeekableMedia(current, 'console-error');
			}

			return;
		}

		if (action.type === 'seek-if-not-playing') {
			if (action.why !== null) {
				lastSeek.current = seek({
					mediaRef: current,
					time: action.shouldBeTime,
					why: action.why,
				});
			}

			return;
		}

		// action.type === 'play-and-seek'
		if (action.why !== null) {
			lastSeek.current = seek({
				mediaRef: current,
				time: action.shouldBeTime,
				why: action.why,
			});
		}

		playMedia({
			mediaRef,
			mediaType,
			onAutoPlayError,
			reason: action.playReason,
		});
		if (action.bufferUntilFirstFrame) {
			bufferUntilFirstFrame(action.shouldBeTime);
		}
	}, [
		absoluteFrame,
		acceptableTimeShiftButLessThanDuration,
		bufferUntilFirstFrame,
		rvcCurrentTime,
		desiredUnclampedTime,
		isBuffering,
		isMediaTagBuffering,
		mediaRef,
		mediaType,
		onlyWarnForMediaSeekingError,
		playbackRate,
		playerBuffering,
		playing,
		src,
		onAutoPlayError,
		isPremounting,
		isPostmounting,
		pauseWhenBuffering,
		mediaTagCurrentTime,
		seek,
		playMedia,
	]);
};
