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

	useBrowserMediaSession({
		browserMediaControlsBehavior,
		playbackRate,
		videoConfig: config,
	});

	const updateAudioAnchor = useCallback(
		(absoluteFrame: number) => {
			if (!sharedAudioContext?.audioContext || !config || muted) {
				return;
			}

			const changed = setGlobalTimeAnchor({
				audioContext: sharedAudioContext.audioContext,
				audioSyncAnchor: sharedAudioContext.audioSyncAnchor,
				absoluteTimeInSeconds: absoluteFrame / config.fps,
				globalPlaybackRate: playbackRate,
				logLevel,
				force: true,
			});
			if (changed) {
				sharedAudioContext.audioSyncAnchorEmitter.dispatch('changed');
			}
		},
		[config, logLevel, muted, playbackRate, sharedAudioContext],
	);

	// Re-anchor only at playback boundaries. A late React commit during ordinary
	// playback must not move the audio clock and discard already scheduled audio.
	useLayoutEffect(() => {
		anchorSeekRevision.current = seekRevisionAtRender;
		updateAudioAnchor(getCurrentFrame());
	}, [
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

		if (!config) {
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
	}, [config, getCurrentFrame, muted, sharedAudioContext, updateAudioAnchor]);

	useEffect(() => {
		if (!config) {
			return;
		}

		if (!playing) {
			sharedAudioContext?.suspend?.();
			return;
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
		let startedTime = performance.now();
		let framesAdvanced = 0;
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

			const time = performance.now() - startedTime;
			const actualLastFrame = outFrame ?? config.durationInFrames - 1;
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
				fps: config.fps,
				actualFirstFrame,
				actualLastFrame,
				framesAdvanced,
				shouldLoop: loop,
			});

			framesAdvanced += framesToAdvance;

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
					setFrameFromPlayback((c) => ({...c, [config.id]: frameToDisplay}));
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

					startedTime = performance.now();
					framesAdvanced = 0;
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

					startedTime = performance.now();
					framesAdvanced = 0;
					queueNextFrame();
				});
				return;
			}

			if (isBackgroundedRef.current) {
				reqAnimFrameCall = {
					type: 'timeout',
					// Note: Most likely, this will not be 1000 / fps, but the browser will throttle it to ~1/sec.
					id: setTimeout(callback, 1000 / config.fps),
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
		config,
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
