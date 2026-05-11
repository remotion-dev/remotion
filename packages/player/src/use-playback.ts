import {useLayoutEffect} from 'react';
/* eslint-disable @typescript-eslint/no-use-before-define */
import {useContext, useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import type {BrowserMediaControlsBehavior} from './browser-mediasession.js';
import {useBrowserMediaSession} from './browser-mediasession.js';
import {calculateNextFrame} from './calculate-next-frame.js';
import {useIsBackgrounded} from './is-backgrounded.js';
import {setGlobalTimeAnchor} from './set-global-time-anchor.js';
import type {GetCurrentFrame} from './use-frame-imperative.js';
import {usePlayer} from './use-player.js';

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
	getCurrentFrame: GetCurrentFrame;
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
		});
		if (changed) {
			sharedAudioContext.audioSyncAnchorEmitter.dispatch('changed');
		}
	}, [config, frame, logLevel, playbackRate, sharedAudioContext, muted]);

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

			if (!muted) {
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

		const queueNextFrame = () => {
			const getIsResumingAudioContext =
				sharedAudioContext?.getIsResumingAudioContext?.() ?? null;
			if (getIsResumingAudioContext !== null && !muted) {
				getIsResumingAudioContext.then(() => {
					if (!sharedAudioContext?.audioContext) {
						return;
					}

					if (!sharedAudioContext.audioSyncAnchor) {
						return;
					}

					// set it here and DON'T propagate an event
					// the useLayoutEffect above is supposed to handle a user seek,
					// this is a natural wait for the audio playback to start.
					// we don't wanna destroy the iterators.
					setGlobalTimeAnchor({
						audioContext: sharedAudioContext.audioContext,
						audioSyncAnchor: sharedAudioContext.audioSyncAnchor,
						absoluteTimeInSeconds: getCurrentFrame() / config.fps,
						globalPlaybackRate: playbackRate,
						logLevel,
					});
					startedTime = performance.now();
					framesAdvanced = 0;
					queueNextFrame();
				});

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
