import {useLayoutEffect} from 'react';
/* eslint-disable @typescript-eslint/no-use-before-define */
import {useCallback, useContext, useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import type {RemotionAudioContextState} from 'remotion';
import type {BrowserMediaControlsBehavior} from './browser-mediasession.js';
import {useBrowserMediaSession} from './browser-mediasession.js';
import {calculateNextFrame} from './calculate-next-frame.js';
import {useIsBackgrounded} from './is-backgrounded.js';
import {setGlobalTimeAnchor} from './set-global-time-anchor.js';
import {type UsePlayerMethods, usePlayerMethods} from './use-player-methods.js';

const shouldForceAnchorChange = (newState: RemotionAudioContextState) => {
	if (newState === 'closed') {
		return false;
	}

	if (
		newState === 'suspended' ||
		newState === 'running-to-suspended' ||
		newState === 'interrupted' ||
		newState === 'running' ||
		newState === 'suspended-to-running'
	) {
		return true;
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
	const seekRevisionAtRender = seek?.revision.current ?? null;
	const anchorSeekRevision = useRef(seekRevisionAtRender);
	const audioLoopRevision = useRef(0);
	const loopRevision = audioLoopRevision.current;
	const playbackClockRef = useRef<PlaybackClock | null>(null);
	const previousAudioBoundary = useRef<{
		audioContext: AudioContext | null;
		compositionId: string | null;
		fps: number | null;
		playbackRate: number;
		muted: boolean;
		playing: boolean;
		seekRevision: number | null;
		loopRevision: number;
	} | null>(null);

	useBrowserMediaSession({
		browserMediaControlsBehavior,
		playbackRate,
		videoConfig: config,
	});

	const updateAudioAnchor = useCallback(
		(absoluteFrame: number) => {
			if (!sharedAudioContext?.audioContext || fps === null || muted) {
				return false;
			}

			const changed = setGlobalTimeAnchor({
				audioContext: sharedAudioContext.audioContext,
				audioSyncAnchor: sharedAudioContext.audioSyncAnchor,
				absoluteTimeInSeconds: absoluteFrame / fps,
				globalPlaybackRate: playbackRate,
				logLevel,
				force: true,
			});
			if (changed) {
				sharedAudioContext.audioSyncAnchorEmitter.dispatch('changed');
			}

			return changed;
		},
		[fps, logLevel, muted, playbackRate, sharedAudioContext],
	);

	// Re-anchor only at playback boundaries. A late React commit during ordinary
	// playback must not move the audio clock and discard already scheduled audio.
	useLayoutEffect(() => {
		const boundary = {
			audioContext: sharedAudioContext?.audioContext ?? null,
			compositionId,
			fps,
			playbackRate,
			muted,
			playing,
			seekRevision: seekRevisionAtRender,
			loopRevision,
		};
		const previous = previousAudioBoundary.current;
		previousAudioBoundary.current = boundary;
		anchorSeekRevision.current = seekRevisionAtRender;
		if (
			previous !== null &&
			Object.keys(boundary).every(
				(key) =>
					boundary[key as keyof typeof boundary] ===
					previous[key as keyof typeof boundary],
			)
		) {
			return;
		}

		const changed = updateAudioAnchor(getCurrentFrame());
		if (
			!changed &&
			playing &&
			!muted &&
			sharedAudioContext?._experimentalKeepAudioContextAlive
		) {
			// A changed timebase can invalidate queued audio even at the same anchor.
			sharedAudioContext.audioSyncAnchorEmitter.dispatch('changed');
		}
	}, [
		compositionId,
		fps,
		playbackRate,
		muted,
		sharedAudioContext,
		getCurrentFrame,
		loopRevision,
		playing,
		seekRevisionAtRender,
		updateAudioAnchor,
	]);

	// Native pauses, resumes and interruptions are clock boundaries too.
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
				updateAudioAnchor(getCurrentFrame());
			}
		};

		audioContext?.addEventListener('statechange', callback);
		return () => {
			audioContext?.removeEventListener('statechange', callback);
		};
	}, [fps, getCurrentFrame, muted, sharedAudioContext, updateAudioAnchor]);

	useEffect(() => {
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
				if (anchorSeekRevision.current !== seekRevision) {
					// A same-frame seek may not cause a React commit. It still needs
					// an exact anchor before advancing playback from that position.
					updateAudioAnchor(playbackFrame);
				}
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

			if (!isBuffering()) {
				const didLoop = loop && nextFrame !== currentFrame + framesToAdvance;
				if (didLoop) {
					// Re-anchor after the loop's target frame commits.
					audioLoopRevision.current++;
				}

				if (frameToDisplay !== currentFrame) {
					playbackFrame = frameToDisplay;
					setFrameFromPlayback((c) => ({
						...c,
						[compositionId]: frameToDisplay,
					}));
				} else if (didLoop) {
					// A loop can wrap back to the same frame without a React commit.
					updateAudioAnchor(frameToDisplay);
				}
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
					if (hasBeenStopped) {
						return;
					}

					// The context clock may have advanced while the timeline was
					// stalled, especially with _experimentalKeepAudioContextAlive.
					updateAudioAnchor(getCurrentFrame());
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
		muted,
		updateAudioAnchor,
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
