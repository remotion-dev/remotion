import {useCallback, useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import {usePlayer} from './use-player';

type usePlaybackType = (args: {loop: boolean}) => {playbackSpeed: number};

export const usePlayback: usePlaybackType = ({loop}) => {
	const frame = Internals.Timeline.useTimelinePosition();
	const config = Internals.useUnsafeVideoConfig();
	const {playing, pause, emitter} = usePlayer();
	const setFrame = Internals.Timeline.useTimelineSetFrame();

	const playbackSpeed = useRef<number>(1);
	const timelastSpeedChange = useRef<number>();
	const nextFrame = useRef(frame);
	const frameCountBeforeChange = useRef(frame);
	const frameRef = useRef(frame);
	frameRef.current = frame;

	const lastTimeUpdateEvent = useRef<number | null>(null);

	const decreasePlaybackSpeed = useCallback(() => {
		const newSpeed = Math.max(playbackSpeed.current / 2, 1 / 4);
		if (newSpeed !== playbackSpeed.current) {
			timelastSpeedChange.current = performance.now();
			frameCountBeforeChange.current = nextFrame.current;
		}

		playbackSpeed.current = newSpeed;
	}, []);

	const increasePlaybackSpeed = useCallback(() => {
		const newSpeed = Math.min(playbackSpeed.current * 2, 4);
		if (newSpeed !== playbackSpeed.current) {
			timelastSpeedChange.current = performance.now();
			frameCountBeforeChange.current = nextFrame.current;
		}

		playbackSpeed.current = newSpeed;
	}, []);

	useEffect(() => {
		emitter?.addEventListener('slower', decreasePlaybackSpeed);
		emitter?.addEventListener('faster', increasePlaybackSpeed);
		return () => {
			emitter.removeEventListener('slower', decreasePlaybackSpeed);
			emitter.removeEventListener('faster', increasePlaybackSpeed);
		};
	}, [increasePlaybackSpeed, decreasePlaybackSpeed, emitter]);

	useEffect(() => {
		if (!config) {
			return;
		}

		if (!playing) {
			return;
		}

		let hasBeenStopped = false;
		let reqAnimFrameCall: number | null = null;
		const startedTime = performance.now();
		if (hasBeenStopped) {
			timelastSpeedChange.current = undefined;
		}

		const stop = () => {
			hasBeenStopped = true;
			if (reqAnimFrameCall !== null) {
				cancelAnimationFrame(reqAnimFrameCall);
			}
		};

		const callback = () => {
			const now = performance.now();
			const timeSinceLastChange =
				now - (timelastSpeedChange.current || startedTime);
			const framesSinceChange = Math.round(
				(timeSinceLastChange * playbackSpeed.current) / (1000 / config.fps)
			);
			nextFrame.current = frameCountBeforeChange.current + framesSinceChange;

			if (nextFrame.current === config.durationInFrames && !loop) {
				stop();
				pause();
				emitter.dispatchEnded();
				return;
			}

			const actualNextFrame = nextFrame.current % config.durationInFrames;
			if (actualNextFrame !== frameRef.current) {
				setFrame(actualNextFrame);
			}

			if (!hasBeenStopped) {
				reqAnimFrameCall = requestAnimationFrame(callback);
			}
		};

		reqAnimFrameCall = requestAnimationFrame(callback);

		return () => {
			stop();
		};
	}, [config, loop, pause, playing, setFrame, emitter]);

	useEffect(() => {
		const interval = setInterval(() => {
			if (lastTimeUpdateEvent.current === frameRef.current) {
				return;
			}

			emitter.dispatchTimeUpdate({frame: frameRef.current as number});
			lastTimeUpdateEvent.current = frameRef.current;
		}, 250);

		return () => clearInterval(interval);
	}, [emitter, config]);

	return {playbackSpeed: playbackSpeed.current};
};
