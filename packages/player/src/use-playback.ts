import {useCallback, useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import {usePlayer} from './use-player';

const calculateNextFrame = (
	time: number,
	startFrame: number,
	playbackSpeed: number,
	fps: number,
	durationInFrames: number
) => {
	const op = playbackSpeed < 0 ? Math.ceil : Math.floor;
	const numberOfFrameChanges = op((time * playbackSpeed) / (1000 / fps));

	const nextFrame =
		(numberOfFrameChanges + startFrame + durationInFrames) % durationInFrames;
	return nextFrame < 0 ? nextFrame + durationInFrames : nextFrame;
};

const MAX_PLAYBACKSPEED = 4;

export const usePlayback = ({loop}: {loop: boolean}) => {
	const frame = Internals.Timeline.useTimelinePosition();
	const config = Internals.useUnsafeVideoConfig();
	const {playing, pause, emitter} = usePlayer();
	const setFrame = Internals.Timeline.useTimelineSetFrame();

	const playbackSpeed = useRef<number>(1);
	const playbackChangeTime = useRef<number>();
	const playbackChangeFrame = useRef<number>(frame);
	const nextFrame = useRef<number>(frame);
	const frameRef = useRef(frame);
	frameRef.current = frame;

	const lastTimeUpdateEvent = useRef<number | null>(null);

	const slowerPlayback = useCallback(() => {
		playbackSpeed.current = Math.max(
			playbackSpeed.current - 1,
			-MAX_PLAYBACKSPEED
		);
		if (playbackSpeed.current === 0) playbackSpeed.current = -1;

		playbackChangeFrame.current = nextFrame.current;
		playbackChangeTime.current = performance.now();
	}, []);
	const fasterPlayback = useCallback(() => {
		playbackSpeed.current = Math.min(
			playbackSpeed.current + 1,
			MAX_PLAYBACKSPEED
		);
		if (playbackSpeed.current === 0) playbackSpeed.current = 1;

		playbackChangeFrame.current = nextFrame.current;
		playbackChangeTime.current = performance.now();
	}, []);

	useEffect(() => {
		emitter?.addEventListener('slower', slowerPlayback);
		emitter?.addEventListener('faster', fasterPlayback);
		return () => {
			emitter?.removeEventListener('slower', slowerPlayback);
			emitter?.removeEventListener('faster', fasterPlayback);
		};
	}, [emitter, fasterPlayback, slowerPlayback]);

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
			playbackChangeTime.current = undefined;
			playbackChangeFrame.current = nextFrame.current;
			if (reqAnimFrameCall !== null) {
				cancelAnimationFrame(reqAnimFrameCall);
			}
		};

		const callback = (now: DOMHighResTimeStamp) => {
			// const now = performance.now();

			const time =
				playbackChangeTime.current === undefined
					? now - startedTime
					: now - playbackChangeTime.current;
			nextFrame.current = calculateNextFrame(
				time,
				playbackChangeFrame.current || startedFrame,
				playbackSpeed.current,
				config.fps,
				config.durationInFrames
			);

			const finalFrame =
				playbackSpeed.current > 0 ? config.durationInFrames : 0;
			if (nextFrame.current === finalFrame && !loop) {
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
	}, [emitter]);

	return {playbackSpeed: playbackSpeed.current};
};
