/* eslint-disable @typescript-eslint/no-use-before-define */
import {useContext, useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import type {BrowserMediaControlsBehavior} from './browser-mediasession.js';
import {useBrowserMediaSession} from './browser-mediasession.js';
import {calculateNextFrame} from './calculate-next-frame.js';
import {useIsBackgrounded} from './is-backgrounded.js';
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
}: {
	loop: boolean;
	playbackRate: number;
	moveToBeginningWhenEnded: boolean;
	inFrame: number | null;
	outFrame: number | null;
	browserMediaControlsBehavior: BrowserMediaControlsBehavior;
	getCurrentFrame: GetCurrentFrame;
}) => {
	const config = Internals.useUnsafeVideoConfig();
	const frame = Internals.Timeline.useTimelinePosition();
	const {playing, pause, emitter} = usePlayer();
	const setFrame = Internals.Timeline.useTimelineSetFrame();
	const buffering = useRef<null | number>(null);

	// requestAnimationFrame() does not work if the tab is not active.
	// This means that audio will keep playing even if it has ended.
	// In that case, we use setTimeout() instead.
	const isBackgroundedRef = useIsBackgrounded();

	const lastTimeUpdateEvent = useRef<number | null>(null);

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

	//	complete code for media session API

	useEffect(() => {
		const onBufferClear = context.listenForBuffering(() => {
			buffering.current = performance.now();
		});

		const onResumeClear = context.listenForResume(() => {
			buffering.current = null;
		});

		return () => {
			onBufferClear.remove();
			onResumeClear.remove();
		};
	}, [context]);

	useEffect(() => {
		if (!config) {
			return;
		}

		if (!playing) {
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
				(!hasEnded || moveToBeginningWhenEnded)
			) {
				setFrame((c) => ({...c, [config.id]: nextFrame}));
			}

			if (hasEnded) {
				stop();
				pause();
				emitter.dispatchEnded();
				return;
			}

			if (!hasBeenStopped) {
				queueNextFrame();
			}
		};

		const queueNextFrame = () => {
			if (buffering.current) {
				const stopListening = context.listenForResume(() => {
					stopListening.remove();
					if (hasBeenStopped) {
						return;
					}

					startedTime = performance.now();
					framesAdvanced = 0;
					callback();
				});
				return;
			}

			if (isBackgroundedRef.current) {
				reqAnimFrameCall = {
					type: 'timeout',
					// Note: Most likely, this will not be 1000 / fps, but the browser will throttle it to ~1/sec.
					id: setTimeout(callback, 1000 / config.fps),
				};
			} else {
				reqAnimFrameCall = {type: 'raf', id: requestAnimationFrame(callback)};
			}
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
		buffering,
		context,
	]);

	useEffect(() => {
		const interval = setInterval(() => {
			if (lastTimeUpdateEvent.current === getCurrentFrame()) {
				return;
			}

			emitter.dispatchTimeUpdate({frame: getCurrentFrame()});
			lastTimeUpdateEvent.current = getCurrentFrame();
		}, 250);

		return () => clearInterval(interval);
	}, [emitter, getCurrentFrame]);

	useEffect(() => {
		emitter.dispatchFrameUpdate({frame});
	}, [emitter, frame]);
};
