import {useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import {usePlayer} from './use-player';

export const usePlayback = ({loop}: {loop: boolean}) => {
	const frame = Internals.Timeline.useTimelinePosition();
	const config = Internals.useUnsafeVideoConfig();
	const {playing, pause, emitter} = usePlayer();
	const setFrame = Internals.Timeline.useTimelineSetFrame();

	const frameRef = useRef(frame);
	frameRef.current = frame;

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
		const startedFrame = frameRef.current;

		const stop = () => {
			hasBeenStopped = true;
			if (reqAnimFrameCall !== null) {
				cancelAnimationFrame(reqAnimFrameCall);
			}
		};

		const callback = () => {
			const time = performance.now() - startedTime;
			const nextFrame = Math.round(time / (1000 / config.fps)) + startedFrame;
			if (nextFrame === config.durationInFrames && !loop) {
				stop();
				pause();
				emitter.dispatchEnded();
				return;
			}

			const actualNextFrame = nextFrame % config.durationInFrames;
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
		if (!playing) {
			return;
		}

		const interval = setInterval(() => {
			emitter.dispatchTimeUpdate({frame: frameRef.current as number});
		}, 250);

		return () => clearInterval(interval);
	}, [emitter, playing]);
};
