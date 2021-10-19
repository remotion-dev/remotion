import {useCallback, useEffect, useRef, useState} from 'react';
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

const ABSOLUTE_MAX_PLAYBACKSPEED = 4;

export type PlaybackRateType = -4 | -3 | -2 | -1 | 1 | 2 | 3 | 4;

export const usePlayback = ({
	loop,
	playbackRate = 1,
}: {
	loop: boolean;
	playbackRate?: PlaybackRateType;
}) => {
	const frame = Internals.Timeline.useTimelinePosition();
	const config = Internals.useUnsafeVideoConfig();
	const {playing, pause, emitter} = usePlayer();
	const setFrame = Internals.Timeline.useTimelineSetFrame();

	const [playbackSpeed, setPlaybackSpeed] = useState<number>(playbackRate);
	const playbackChangeTime = useRef<number>();
	const playbackChangeFrame = useRef<number>(frame);
	const nextFrame = useRef<number>(frame);
	const frameRef = useRef(frame);
	frameRef.current = frame;

	const lastTimeUpdateEvent = useRef<number | null>(null);

	const slowerPlayback = useCallback(() => {
		let newSpeed = Math.max(playbackSpeed - 1, -ABSOLUTE_MAX_PLAYBACKSPEED);
		if (newSpeed === 0) newSpeed = -1;

		setPlaybackSpeed(newSpeed);

		playbackChangeFrame.current = nextFrame.current;
		playbackChangeTime.current = performance.now();
	}, [playbackSpeed, setPlaybackSpeed]);
	const fasterPlayback = useCallback(() => {
		let newSpeed = Math.min(playbackSpeed + 1, ABSOLUTE_MAX_PLAYBACKSPEED);
		if (newSpeed === 0) newSpeed = 1;

		setPlaybackSpeed(newSpeed);

		playbackChangeFrame.current = nextFrame.current;
		playbackChangeTime.current = performance.now();
	}, [playbackSpeed, setPlaybackSpeed]);

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
				playbackSpeed,
				config.fps,
				config.durationInFrames
			);

			const finalFrame = playbackSpeed > 0 ? config.durationInFrames : 0;
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
	}, [config, loop, pause, playing, setFrame, emitter, playbackSpeed]);

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

	return {playbackSpeed};
};
