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
import {usePlayer} from './use-player.js';

const AUDIO_CONTEXT_RESUME_DEADLINE_MS = 500;

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
	getCurrentFrame: ReturnType<typeof usePlayer>['getCurrentFrame'];
	muted: boolean;
}) => {
	const config = Internals.useUnsafeVideoConfig();
	const frame = Internals.Timeline.useTimelinePosition();
	const {playing, pause, emitter, isPlaying} = usePlayer();
	const setFrame = Internals.Timeline.useTimelineSetFrame();
	const sharedAudioContext = useContext(Internals.SharedAudioContext);
	const logLevel = Internals.useLogLevel();

	// requestAnimationFrame() does not work if the tab is not active.
	// This means that audio will keep playing even if it has ended.
	// In that case, we use setTimeout() instead.
	const isBackgroundedRef = useIsBackgrounded();

	const lastTimeUpdateTimestamp = useRef<number>(0);

	const context = useContext(Internals.BufferingContextReact);
	if (!context) {
		throw new Error(
			'Missing the buffering context. Most likely you have a Remotion version mismatch.',
		);
	}

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

		if (!config) {
			return;
		}

		if (muted) {
			return;
		}

		const changed = setGlobalTimeAnchor({
			audioContext: sharedAudioContext.audioContext,
			audioSyncAnchor: sharedAudioContext.audioSyncAnchor,
			absoluteTimeInSeconds: frame / config.fps,
			globalPlaybackRate: playbackRate,
			logLevel,
			force: false,
		});
		if (changed) {
			sharedAudioContext.audioSyncAnchorEmitter.dispatch('changed');
		}
	}, [config, frame, logLevel, playbackRate, sharedAudioContext, muted]);

	// When the audio context is suspended, we use the opportunity to
	// re-anchor the time to be exact.
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
				setGlobalTimeAnchor({
					audioContext,
					audioSyncAnchor: sharedAudioContext.audioSyncAnchor,
					absoluteTimeInSeconds: getCurrentFrame() / config.fps,
					globalPlaybackRate: playbackRate,
					logLevel,
					force: true,
				});
			}
		};

		audioContext?.addEventListener('statechange', callback);
		return () => {
			audioContext?.removeEventListener('statechange', callback);
		};
	}, [
		config,
		getCurrentFrame,
		logLevel,
		muted,
		playbackRate,
		sharedAudioContext,
	]);

	useEffect(() => {
		if (!config) {
			return;
		}

		if (!playing) {
			sharedAudioContext?.suspend?.();
			return;
		}

		let hasBeenStopped = false;
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

			if (!muted && !context.buffering.current) {
				sharedAudioContext?.resume?.();
			}

			const time = performance.now() - startedTime;
			const actualLastFrame = outFrame ?? config.durationInFrames - 1;
			const actualFirstFrame = inFrame ?? 0;

			const currentFrame = getCurrentFrame();
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

			if (
				nextFrame !== getCurrentFrame() &&
				(!hasEnded || moveToBeginningWhenEnded) &&
				!context.buffering.current
			) {
				setFrame((c) => ({...c, [config.id]: nextFrame}));
			}

			if (hasEnded) {
				stop();
				pause();
				emitter.dispatchEnded();
				return;
			}

			queueNextFrame();
		};

		// AudioContext.resume() promises can stay pending forever in Chromium
		// when a suspend() lands while the resume is still in flight - which
		// happens routinely when the user scrubs while playing, because each
		// effect teardown calls suspend(). Waiting on such a promise without a
		// deadline parks the playback loop permanently: isPlaying() stays true,
		// the frame clock never advances, and only a seek or pause/play revives
		// it. Bound the wait; past the deadline, keep ticking without audio and
		// let audio rejoin once the context actually resumes.
		let audioResumeBypass = false;

		const queueNextFrame = () => {
			if (hasBeenStopped) {
				return;
			}

			const getIsResumingAudioContext =
				sharedAudioContext?.getIsResumingAudioContext?.() ?? null;
			if (getIsResumingAudioContext !== null && !muted && !audioResumeBypass) {
				let continued = false;
				const continuePlayback = () => {
					if (continued || hasBeenStopped) {
						return;
					}

					continued = true;
					startedTime = performance.now();
					framesAdvanced = 0;
					queueNextFrame();
				};

				getIsResumingAudioContext.then(() => {
					audioResumeBypass = false;
					continuePlayback();
				});
				setTimeout(() => {
					audioResumeBypass = true;
					continuePlayback();
				}, AUDIO_CONTEXT_RESUME_DEADLINE_MS);

				return;
			}

			if (context.buffering.current) {
				if (!muted) {
					sharedAudioContext?.suspend?.();
				}

				const stopListening = context.listenForResume(() => {
					stopListening.remove();
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
		setFrame,
		emitter,
		playbackRate,
		inFrame,
		outFrame,
		moveToBeginningWhenEnded,
		isBackgroundedRef,
		getCurrentFrame,
		context,
		isPlaying,
		sharedAudioContext,
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
