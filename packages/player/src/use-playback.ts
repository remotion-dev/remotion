import {useLayoutEffect} from 'react';
/* eslint-disable @typescript-eslint/no-use-before-define */
import {useContext, useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import type {RemotionAudioContextState} from 'remotion';
import type {BrowserMediaControlsBehavior} from './browser-mediasession.js';
import {useBrowserMediaSession} from './browser-mediasession.js';
import {calculateNextFrame} from './calculate-next-frame.js';
import {useIsBackgrounded} from './is-backgrounded.js';
import {setGlobalTimeAnchor} from './set-global-time-anchor.js';
import {type UsePlayerMethods, usePlayerMethods} from './use-player-methods.js';

const shouldForceAnchorChange = (newState: RemotionAudioContextState) => {
	if (newState === 'suspended' || newState === 'running-to-suspended') {
		return true;
	}

	if (
		newState === 'closed' ||
		newState === 'interrupted' ||
		newState === 'running' ||
		newState === 'suspended-to-running'
	) {
		return false;
	}

	throw new Error(
		`Unexpected audio context state: ${newState satisfies never}`,
	);
};

// The start timestamp and the frames already advanced within the current
// frame are kept across re-runs of the playback effect, so that a re-run
// (e.g. because durationInFrames changed, see issue #12279) does not
// restart the clock from the current frame and lose the already elapsed
// portion of the frame.
// A fresh clock is created only where a restart is correct: when starting
// playback, or when the composition, fps or playback rate changed mid-playback.
type PlaybackClock = {
	compositionId: string;
	startedTime: number;
	framesAdvanced: number;
	fps: number;
	playbackRate: number;
};

export const usePlayback = ({
	loop,
	playbackRate,
	moveToBeginningWhenEnded,
	inFrame,
	outFrame,
	browserMediaControlsBehavior,
	getCurrentFrame,
	muted,
}: {
	loop: boolean;
	playbackRate: number;
	moveToBeginningWhenEnded: boolean;
	inFrame: number | null;
	outFrame: number | null;
	browserMediaControlsBehavior: BrowserMediaControlsBehavior;
	getCurrentFrame: UsePlayerMethods['getCurrentFrame'];
	muted: boolean;
}) => {
	const config = Internals.useUnsafeVideoConfig();
	const fps = config?.fps ?? null;
	const durationInFrames = config?.durationInFrames ?? null;
	const compositionId = config?.id ?? null;
	const frame = Internals.Timeline.useTimelinePosition();
	const playing = Internals.usePlaying();
	const {pause, emitter, isPlaying} = usePlayerMethods();
	const setFrameFromPlayback =
		Internals.Timeline.useTimelineSetFrameWithoutSeek();
	const sharedAudioContext = useContext(Internals.SharedAudioContext);
	const {setPlayerMuted} = useContext(Internals.SetMediaVolumeContext);
	const {isBuffering, subscribeBuffering, seek} = useContext(
		Internals.SetTimelineContext,
	);
	const logLevel = Internals.useLogLevel();

	// requestAnimationFrame() does not work if the tab is not active.
	// This means that audio will keep playing even if it has ended.
	// In that case, we use setTimeout() instead.
	const isBackgroundedRef = useIsBackgrounded();

	const lastTimeUpdateTimestamp = useRef<number>(0);
	const playbackClockRef = useRef<PlaybackClock | null>(null);
	const previousMutedRef = useRef(muted);
	const anchoredAudioContextRef = useRef<AudioContext | null>(null);

	useBrowserMediaSession({
		browserMediaControlsBehavior,
		playbackRate,
		videoConfig: config,
	});

	// Update time anchor when seeking:
	// If the user clicked on a different time in the timeline, we need to re-sync the anchor
	useLayoutEffect(() => {
		if (!sharedAudioContext) {
			return;
		}

		if (!sharedAudioContext.audioContext) {
			return;
		}

		if (fps === null) {
			return;
		}

		if (muted) {
			return;
		}

		const changed = setGlobalTimeAnchor({
			audioContext: sharedAudioContext.audioContext,
			audioSyncAnchor: sharedAudioContext.audioSyncAnchor,
			absoluteTimeInSeconds: frame / fps,
			globalPlaybackRate: playbackRate,
			logLevel,
			force: false,
		});
		if (changed) {
			sharedAudioContext.audioSyncAnchorEmitter.dispatch('changed');
		}
	}, [fps, frame, logLevel, playbackRate, sharedAudioContext, muted]);

	// When the audio context is suspended, we use the opportunity to
	// re-anchor the time to be exact.
	useLayoutEffect(() => {
		const audioContext = sharedAudioContext?.audioContext;
		if (!audioContext) {
			return;
		}

		if (fps === null) {
			return;
		}

		if (muted) {
			return;
		}

		const callback = () => {
			const newState = sharedAudioContext?.getAudioContextState();
			if (newState && shouldForceAnchorChange(newState)) {
				const changed = setGlobalTimeAnchor({
					audioContext,
					audioSyncAnchor: sharedAudioContext.audioSyncAnchor,
					absoluteTimeInSeconds: getCurrentFrame() / fps,
					globalPlaybackRate: playbackRate,
					logLevel,
					force: true,
				});
				if (changed) {
					sharedAudioContext.audioSyncAnchorEmitter.dispatch('changed');
				}
			}
		};

		audioContext?.addEventListener('statechange', callback);
		return () => {
			audioContext?.removeEventListener('statechange', callback);
		};
	}, [fps, getCurrentFrame, logLevel, muted, playbackRate, sharedAudioContext]);

	useEffect(() => {
		const wasMuted = previousMutedRef.current;
		previousMutedRef.current = muted;

		if (fps === null || durationInFrames === null || compositionId === null) {
			playbackClockRef.current = null;
			return;
		}

		if (!playing) {
			playbackClockRef.current = null;
			sharedAudioContext?.suspend?.();
			return;
		}

		// Duration and range changes update the endpoint without losing elapsed
		// sub-frame time. A different composition or timebase needs a fresh clock.
		const previousClock = playbackClockRef.current;
		const shouldRestartClock =
			previousClock === null ||
			previousClock.compositionId !== compositionId ||
			previousClock.fps !== fps ||
			previousClock.playbackRate !== playbackRate;
		const clock: PlaybackClock = shouldRestartClock
			? {
					compositionId,
					startedTime: performance.now(),
					framesAdvanced: 0,
					fps,
					playbackRate,
				}
			: previousClock;
		playbackClockRef.current = clock;

		if (
			sharedAudioContext?._experimentalKeepAudioContextAlive &&
			sharedAudioContext.audioContext &&
			!muted
		) {
			const didUnmute = wasMuted && !muted;
			const didReplaceAudioContext =
				anchoredAudioContextRef.current !== sharedAudioContext.audioContext;
			const shouldRescheduleAudio =
				shouldRestartClock || didUnmute || didReplaceAudioContext;

			// The native clock keeps running through pauses and muted playback.
			// These transitions need an exact anchor, as does a replacement context
			// with its own time origin. Other effect re-runs use the drift tolerance
			// so duration changes do not introduce frame-quantized audio shifts.
			const changed = setGlobalTimeAnchor({
				audioContext: sharedAudioContext.audioContext,
				audioSyncAnchor: sharedAudioContext.audioSyncAnchor,
				absoluteTimeInSeconds: getCurrentFrame() / fps,
				globalPlaybackRate: playbackRate,
				logLevel,
				force: shouldRescheduleAudio,
			});
			anchoredAudioContextRef.current = sharedAudioContext.audioContext;
			// A changed timebase can invalidate queued audio even if the anchor
			// happens to remain numerically equal (for example at frame zero).
			if (changed || shouldRescheduleAudio) {
				sharedAudioContext.audioSyncAnchorEmitter.dispatch('changed');
			}
		}

		let hasBeenStopped = false;
		let audioContextFailed = false;
		let reqAnimFrameCall:
			| {
					type: 'raf';
					id: number;
			  }
			| {
					type: 'timeout';
					id: Timer;
			  }
			| null = null;
		let playbackFrame = getCurrentFrame();
		let lastSeekRevision = seek?.revision.current ?? null;

		const cancelQueuedFrame = () => {
			if (reqAnimFrameCall !== null) {
				if (reqAnimFrameCall.type === 'raf') {
					cancelAnimationFrame(reqAnimFrameCall.id);
				} else {
					clearTimeout(reqAnimFrameCall.id);
				}
			}
		};

		const stop = () => {
			hasBeenStopped = true;
			cancelQueuedFrame();
		};

		const callback = () => {
			if (hasBeenStopped) {
				return;
			}

			if (!isPlaying()) {
				sharedAudioContext?.suspend?.();
				return;
			}

			if (!muted && !audioContextFailed && !isBuffering()) {
				sharedAudioContext?.resume?.();
			}

			const time = performance.now() - clock.startedTime;
			const actualLastFrame = outFrame ?? durationInFrames - 1;
			const actualFirstFrame = inFrame ?? 0;

			const seekRevision = seek?.revision.current ?? null;
			if (seekRevision !== lastSeekRevision) {
				playbackFrame = getCurrentFrame();
				lastSeekRevision = seekRevision;
			}

			// React may not have committed the previous playback update yet.
			const currentFrame = playbackFrame;
			const {nextFrame, framesToAdvance, hasEnded} = calculateNextFrame({
				time,
				currentFrame,
				playbackSpeed: playbackRate,
				fps,
				actualFirstFrame,
				actualLastFrame,
				framesAdvanced: clock.framesAdvanced,
				shouldLoop: loop,
			});

			clock.framesAdvanced += framesToAdvance;

			// A late callback can skip the endpoint. Hold that exact frame on end.
			const frameToDisplay =
				hasEnded && !moveToBeginningWhenEnded
					? playbackRate > 0
						? actualLastFrame
						: actualFirstFrame
					: nextFrame;

			if (frameToDisplay !== currentFrame && !isBuffering()) {
				playbackFrame = frameToDisplay;
				setFrameFromPlayback((c) => ({...c, [compositionId]: frameToDisplay}));
			}

			if (hasEnded) {
				stop();
				pause();
				emitter.dispatchEnded();
				return;
			}

			queueNextFrame();
		};

		const queueNextFrame = () => {
			if (hasBeenStopped) {
				return;
			}

			const getIsResumingAudioContext = audioContextFailed
				? null
				: (sharedAudioContext?.getIsResumingAudioContext?.() ?? null);
			if (getIsResumingAudioContext !== null && !muted) {
				getIsResumingAudioContext.then((result) => {
					if (hasBeenStopped) {
						return;
					}

					if (result === 'failed') {
						audioContextFailed = true;
						sharedAudioContext?.suspend();
						setPlayerMuted(true);
					}

					// The audio context is being re-established; start a fresh clock.
					clock.startedTime = performance.now();
					clock.framesAdvanced = 0;
					queueNextFrame();
				});

				return;
			}

			if (isBuffering()) {
				if (!muted && !audioContextFailed) {
					sharedAudioContext?.suspend?.();
				}

				const unsubscribe = subscribeBuffering((state) => {
					if (state.buffering) {
						return;
					}

					unsubscribe();
					if (
						!muted &&
						!audioContextFailed &&
						sharedAudioContext?._experimentalKeepAudioContextAlive
					) {
						sharedAudioContext.resume();
					}

					// Buffered media became reachable; start a fresh clock.
					clock.startedTime = performance.now();
					clock.framesAdvanced = 0;
					queueNextFrame();
				});

				return;
			}

			if (isBackgroundedRef.current) {
				reqAnimFrameCall = {
					type: 'timeout',
					// Note: Most likely, this will not be 1000 / fps, but the browser will throttle it to ~1/sec.
					id: setTimeout(callback, 1000 / fps),
				};
				return;
			}

			reqAnimFrameCall = {type: 'raf', id: requestAnimationFrame(callback)};
		};

		queueNextFrame();

		const onVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				return;
			}

			// If tab goes into the background, cancel requestAnimationFrame() and update immediately.
			// , so the transition to setTimeout() can be fulfilled.
			cancelQueuedFrame();
			callback();
		};

		window.addEventListener('visibilitychange', onVisibilityChange);

		return () => {
			window.removeEventListener('visibilitychange', onVisibilityChange);
			stop();
		};
	}, [
		compositionId,
		durationInFrames,
		fps,
		loop,
		pause,
		playing,
		setFrameFromPlayback,
		emitter,
		playbackRate,
		inFrame,
		outFrame,
		moveToBeginningWhenEnded,
		isBackgroundedRef,
		getCurrentFrame,
		isBuffering,
		isPlaying,
		sharedAudioContext,
		setPlayerMuted,
		subscribeBuffering,
		seek,
		logLevel,
		muted,
	]);

	useEffect(() => {
		const now = performance.now();
		const timeSinceLastUpdate = now - lastTimeUpdateTimestamp.current;

		if (timeSinceLastUpdate >= 250) {
			emitter.dispatchTimeUpdate({frame});
			lastTimeUpdateTimestamp.current = now;
			return;
		}

		const timeoutId = setTimeout(() => {
			emitter.dispatchTimeUpdate({frame});
			lastTimeUpdateTimestamp.current = performance.now();
		}, 250 - timeSinceLastUpdate);

		return () => clearTimeout(timeoutId);
	}, [emitter, frame]);

	useEffect(() => {
		emitter.dispatchFrameUpdate({frame});
	}, [emitter, frame]);
};
