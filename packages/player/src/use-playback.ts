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
	frame: number;
	seekRevision: number | null;
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
	const playbackJumpRevision = useRef(0);
	const jumpRevision = playbackJumpRevision.current;
	const playbackClockRef = useRef<PlaybackClock | null>(null);
	const previousAudioBoundary = useRef<{
		audioContext: AudioContext | null;
		compositionId: string | null;
		fps: number | null;
		playbackRate: number;
		muted: boolean;
		playing: boolean;
		seekRevision: number | null;
		jumpRevision: number;
	} | null>(null);

	useBrowserMediaSession({
		browserMediaControlsBehavior,
		playbackRate,
		videoConfig: config,
	});

	const updateAudioAnchor = useCallback(() => {
		if (!sharedAudioContext?.audioContext || fps === null || muted) {
			return false;
		}

		let absoluteFrame = getCurrentFrame();
		const clock = playbackClockRef.current;
		if (
			playing &&
			clock !== null &&
			durationInFrames !== null &&
			clock.compositionId === compositionId &&
			clock.fps === fps &&
			clock.playbackRate === playbackRate
		) {
			const actualFirstFrame = inFrame ?? 0;
			const actualLastFrame = outFrame ?? durationInFrames - 1;
			const {nextFrame, hasEnded} = calculateNextFrame({
				time: performance.now() - clock.startedTime,
				currentFrame: clock.frame,
				playbackSpeed: playbackRate,
				fps,
				actualFirstFrame,
				actualLastFrame,
				framesAdvanced: clock.framesAdvanced,
				shouldLoop: loop,
			});
			absoluteFrame =
				hasEnded && !moveToBeginningWhenEnded
					? playbackRate > 0
						? actualLastFrame
						: actualFirstFrame
					: nextFrame;
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
	}, [
		compositionId,
		durationInFrames,
		fps,
		getCurrentFrame,
		inFrame,
		logLevel,
		loop,
		moveToBeginningWhenEnded,
		muted,
		outFrame,
		playbackRate,
		playing,
		sharedAudioContext,
	]);

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
			jumpRevision,
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

		const clock = playbackClockRef.current;
		if (clock !== null && clock.seekRevision !== seekRevisionAtRender) {
			clock.frame = getCurrentFrame();
			clock.seekRevision = seekRevisionAtRender;
		}

		const changed = updateAudioAnchor();
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
		jumpRevision,
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
			// Native audio can already be playing while its output timestamp still
			// lags. Keep the schedule established before this resume started.
			if (
				newState === 'running' &&
				sharedAudioContext?.getIsResumingAudioContext()
			) {
				return;
			}

			if (newState && shouldForceAnchorChange(newState)) {
				updateAudioAnchor();
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

		if (muted) {
			sharedAudioContext?.suspend?.();
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
					frame: getCurrentFrame(),
					seekRevision: seek?.revision.current ?? null,
					fps,
					playbackRate,
				}
			: previousClock;
		clock.frame = Internals.Timeline.clampFrameToCompositionRange(
			clock.frame,
			durationInFrames,
		);
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
		let unsubscribeBuffering: (() => void) | null = null;

		const cancelQueuedFrame = () => {
			if (reqAnimFrameCall !== null) {
				if (reqAnimFrameCall.type === 'raf') {
					cancelAnimationFrame(reqAnimFrameCall.id);
				} else {
					clearTimeout(reqAnimFrameCall.id);
				}

				reqAnimFrameCall = null;
			}
		};

		const stop = () => {
			hasBeenStopped = true;
			cancelQueuedFrame();
			unsubscribeBuffering?.();
			unsubscribeBuffering = null;
		};

		const callback = () => {
			reqAnimFrameCall = null;
			if (hasBeenStopped) {
				return;
			}

			if (!isPlaying()) {
				sharedAudioContext?.suspend?.();
				return;
			}

			if (isBuffering()) {
				queueNextFrame();
				return;
			}

			if (!muted && !audioContextFailed) {
				sharedAudioContext?.resume?.();
			}

			const time = performance.now() - clock.startedTime;
			const actualLastFrame = outFrame ?? durationInFrames - 1;
			const actualFirstFrame = inFrame ?? 0;

			const seekRevision = seek?.revision.current ?? null;
			if (seekRevision !== clock.seekRevision) {
				clock.frame = getCurrentFrame();
				clock.seekRevision = seekRevision;
				if (anchorSeekRevision.current !== seekRevision) {
					// A same-frame seek may not cause a React commit. It still needs
					// an exact anchor before advancing playback from that position.
					updateAudioAnchor();
					anchorSeekRevision.current = seekRevision;
					if (previousAudioBoundary.current !== null) {
						previousAudioBoundary.current.seekRevision = seekRevision;
					}
				}
			}

			// React may not have committed the previous playback update yet.
			const currentFrame = clock.frame;
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

			const didJump = frameToDisplay !== currentFrame + framesToAdvance;
			if (didJump) {
				// Re-anchor after the jump's target frame commits.
				playbackJumpRevision.current++;
			}

			clock.frame = frameToDisplay;
			if (frameToDisplay !== currentFrame) {
				setFrameFromPlayback((c) => ({...c, [compositionId]: frameToDisplay}));
			} else if (didJump) {
				// A jump can land on the same frame without a React commit.
				updateAudioAnchor();
				if (previousAudioBoundary.current !== null) {
					previousAudioBoundary.current.jumpRevision =
						playbackJumpRevision.current;
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

				unsubscribeBuffering = subscribeBuffering((state) => {
					if (state.buffering) {
						return;
					}

					unsubscribeBuffering?.();
					unsubscribeBuffering = null;
					if (hasBeenStopped) {
						return;
					}

					// The context clock may have advanced while the timeline was
					// stalled, especially with _experimentalKeepAudioContextAlive.
					clock.startedTime = performance.now();
					clock.framesAdvanced = 0;
					updateAudioAnchor();
					if (
						!muted &&
						!audioContextFailed &&
						sharedAudioContext?._experimentalKeepAudioContextAlive
					) {
						sharedAudioContext.resume();
					}

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

		const unsubscribeSeek = seek?.subscribe(() => {
			clock.startedTime = performance.now();
			clock.framesAdvanced = 0;
		});

		queueNextFrame();

		const onVisibilityChange = () => {
			if (reqAnimFrameCall === null) {
				return;
			}

			cancelQueuedFrame();
			callback();
		};

		window.addEventListener('visibilitychange', onVisibilityChange);

		return () => {
			window.removeEventListener('visibilitychange', onVisibilityChange);
			unsubscribeSeek?.();
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
