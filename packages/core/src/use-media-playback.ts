import type {RefObject} from 'react';
import {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
} from 'react';
import {Html5MediaTrimContext} from './audio/use-audio-frame.js';
import {useBufferUntilFirstFrame} from './buffer-until-first-frame.js';
import {getMediaSyncAction} from './get-media-sync-action.js';
import {useLogLevel, useMountTime} from './log-level-context.js';
import {Log} from './log.js';
import {useCurrentTimeOfMediaTagWithUpdateTimeStamp} from './media-tag-current-time-timestamp.js';
import {playAndHandleNotAllowedError} from './play-and-handle-not-allowed-error.js';
import {playbackLogging} from './playback-logging.js';
import {seek} from './seek.js';
import {SequenceContext} from './SequenceContext.js';
import {
	usePlaying,
	usePlaybackRate,
	useTimelinePosition,
} from './timeline-position-state.js';
import {SetTimelineContext} from './TimelineContext.js';
import {useBuffering} from './use-buffering.js';
import {useCurrentFrame} from './use-current-frame.js';
import {useMediaBuffering} from './use-media-buffering.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
import {useRequestVideoCallbackTime} from './use-request-video-callback-time.js';
import {useSyncExternalStore} from './use-sync-external-store.js';
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
	retainAudioDuringBuffering,
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
	retainAudioDuringBuffering: boolean | null;
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
	const mediaTrimBefore = useContext(Html5MediaTrimContext);
	const lastSeekDueToShift = useRef<number | null>(null);
	const lastSeek = useRef<number | null>(null);
	const logLevel = useLogLevel();
	const mountTime = useMountTime();
	const env = useRemotionEnvironment();
	const retainsBufferedAudio =
		env.isPlayer &&
		!env.isRendering &&
		mediaType === 'audio' &&
		pauseWhenBuffering &&
		retainAudioDuringBuffering === true;
	const {seek: timelineSeek} = useContext(SetTimelineContext);
	const subscribeToSeek = useCallback(
		(listener: () => void) =>
			(retainsBufferedAudio ? timelineSeek?.subscribe(listener) : null) ??
			(() => {}),
		[retainsBufferedAudio, timelineSeek],
	);
	const getSeekRevision = useCallback(
		() => (retainsBufferedAudio ? (timelineSeek?.revision.current ?? 0) : 0),
		[retainsBufferedAudio, timelineSeek],
	);
	const seekRevision = useSyncExternalStore(
		subscribeToSeek,
		getSeekRevision,
		getSeekRevision,
	);
	const bufferingRecovery = useRef<{
		src: string;
		seekRevision: number;
		playbackRate: number;
		fps: number;
		trimBefore: number;
		absoluteFrame: number;
		playerBuffering: boolean;
		holding: boolean;
		resumeFrom: number | null;
	} | null>(null);

	const isVariableFpsVideoMap = useRef<Record<string, boolean>>({});

	const onVariableFpsVideoDetected = useCallback(() => {
		if (!src) {
			return;
		}

		if (isVariableFpsVideoMap.current[src]) {
			return;
		}

		Log.verbose(
			{logLevel, tag: null},
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
		startFrom: mediaTrimBefore,
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

	const sequenceContext = useContext(SequenceContext);
	const playbackRate =
		localPlaybackRate *
		globalPlaybackRate *
		(sequenceContext?.playbackRate ?? 1);

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
		// Loading a resource resets playbackRate to defaultPlaybackRate.
		if (
			mediaRef.current &&
			mediaRef.current.defaultPlaybackRate !== playbackRateToSet
		) {
			mediaRef.current.defaultPlaybackRate = playbackRateToSet;
		}

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
				logLevel,
				tag: 'pause',
				message: `Pausing ${current.src} because ${getPauseReason({
					reason: pauseReason,
					isPremounting,
					isPostmounting,
				})}`,
				mountTime,
			});
			current.pause();
		}

		let action = getMediaSyncAction({
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

		const previousRecovery = bufferingRecovery.current;
		const recoveryWasInterrupted =
			previousRecovery === null ||
			previousRecovery.src !== src ||
			previousRecovery.seekRevision !== seekRevision ||
			previousRecovery.playbackRate !== playbackRate ||
			previousRecovery.fps !== fps ||
			previousRecovery.trimBefore !== mediaTrimBefore ||
			absoluteFrame < previousRecovery.absoluteFrame;
		const canRetainAudio =
			retainsBufferedAudio &&
			playing &&
			playbackRate > 0 &&
			!isPremounting &&
			!isPostmounting &&
			!current.ended &&
			!isMediaTagBufferingOrStalled &&
			Math.abs(current.currentTime - desiredUnclampedTime) <=
				acceptableTimeShiftButLessThanDuration;
		let holding =
			canRetainAudio &&
			!recoveryWasInterrupted &&
			(previousRecovery.holding ||
				// Retain small lags too: a new wait must not skip unheard audio.
				(playerBuffering && !previousRecovery.playerBuffering));
		// play() can clear paused before the native clock starts advancing.
		// Retain recovery until that clock progresses, then restore normal sync.
		let resumeFrom = playerBuffering
			? null
			: (previousRecovery?.resumeFrom ?? null);

		if (
			holding &&
			!playerBuffering &&
			resumeFrom !== null &&
			!current.paused &&
			current.currentTime > resumeFrom
		) {
			holding = false;
		}

		if (
			holding &&
			!playerBuffering &&
			current.currentTime <= desiredUnclampedTime &&
			current.paused &&
			resumeFrom === null
		) {
			resumeFrom = current.currentTime;
		}

		if (!holding) resumeFrom = null;
		bufferingRecovery.current = {
			src,
			seekRevision,
			playbackRate,
			fps,
			trimBefore: mediaTrimBefore,
			absoluteFrame,
			playerBuffering,
			holding,
			resumeFrom,
		};

		// Another media element can freeze the timeline after audio has advanced.
		// Keep that audio position through buffering and let the timeline catch up
		// before resuming, instead of replaying an already heard portion.
		if (holding) {
			if (playerBuffering || current.currentTime > desiredUnclampedTime) {
				action = {type: 'none'};
			} else if (current.paused) {
				action = {
					type: 'play-and-seek',
					shouldBeTime: desiredUnclampedTime,
					// The executor seeks only when why is non-null.
					why: null,
					playReason: 'timeline caught up with retained audio after buffering',
					bufferUntilFirstFrame: false,
				};
			} else {
				action = {type: 'none'};
			}
		}

		if (action.type === 'none') {
			return;
		}

		if (action.type === 'seek-due-to-shift') {
			lastSeek.current = seek({
				mediaRef: current,
				time: action.shouldBeTime,
				logLevel,
				why: action.why,
				mountTime,
			});
			lastSeekDueToShift.current = lastSeek.current;

			if (action.bufferUntilFirstFrame) {
				bufferUntilFirstFrame(action.shouldBeTime);
			}

			if (action.playReason !== null) {
				playAndHandleNotAllowedError({
					mediaRef,
					mediaType,
					onAutoPlayError,
					logLevel,
					mountTime,
					reason: action.playReason,
					isPlayer: env.isPlayer,
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
					logLevel,
					why: action.why,
					mountTime,
				});
			}

			return;
		}

		// action.type === 'play-and-seek'
		if (action.why !== null) {
			lastSeek.current = seek({
				mediaRef: current,
				time: action.shouldBeTime,
				logLevel,
				why: action.why,
				mountTime,
			});
		}

		playAndHandleNotAllowedError({
			mediaRef,
			mediaType,
			onAutoPlayError,
			logLevel,
			mountTime,
			reason: action.playReason,
			isPlayer: env.isPlayer,
		});
		if (action.bufferUntilFirstFrame) {
			bufferUntilFirstFrame(action.shouldBeTime);
		}
	}, [
		absoluteFrame,
		acceptableTimeShiftButLessThanDuration,
		bufferUntilFirstFrame,
		rvcCurrentTime,
		logLevel,
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
		mountTime,
		mediaTagCurrentTime,
		env.isPlayer,
		retainsBufferedAudio,
		seekRevision,
		fps,
		mediaTrimBefore,
	]);
};
