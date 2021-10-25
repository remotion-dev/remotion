import {useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import {usePlayer} from './use-player';

const calculateNextFrame = ({
	time,
	startFrame,
	playbackSpeed,
	fps,
	durationInFrames,
}: {
	time: number;
	startFrame: number;
	playbackSpeed: number;
	fps: number;
	durationInFrames: number;
}) => {
	const op = playbackSpeed < 0 ? Math.ceil : Math.floor;
	const numberOfFrameChanges = op((time * playbackSpeed) / (1000 / fps));

	const nextFrame =
		(numberOfFrameChanges + startFrame + durationInFrames) % durationInFrames;
	return nextFrame < 0 ? nextFrame + durationInFrames : nextFrame;
};

// TODO: validate
const ABSOLUTE_MAX_PLAYBACKSPEED = 4;

export const usePlayback = ({
	loop,
	playbackRate,
}: {
	loop: boolean;
	playbackRate: number;
}) => {
	const frame = Internals.Timeline.useTimelinePosition();
	const config = Internals.useUnsafeVideoConfig();
	const {playing, pause, emitter} = usePlayer();
	const setFrame = Internals.Timeline.useTimelineSetFrame();
	const {inFrame, outFrame} =
		Internals.Timeline.useTimelineInOutFramePosition();

	const playbackChangeTime = useRef<number>();
	const playbackChangeFrame = useRef<number>(frame);
	const nextFrame = useRef<number>(frame);
	const frameRef = useRef(frame);
	frameRef.current = frame;

	const lastTimeUpdateEvent = useRef<number | null>(null);

	useEffect(() => {
		if (!config) {
			return;
		}

		if (!playing) {
			return;
		}

		const getFrameInRange = (proposedNextFrame: number) => {
			if (
				(inFrame && proposedNextFrame < inFrame) ||
				(inFrame && outFrame && proposedNextFrame > outFrame)
			) {
				return inFrame;
			}

			if (outFrame && proposedNextFrame > outFrame) {
				return 0;
			}

			return proposedNextFrame;
		};

		let hasBeenStopped = false;
		let reqAnimFrameCall: number | null = null;
		const startedTime = performance.now();
		const startedFrame = getFrameInRange(frameRef.current);

		const durationInFrames = (() => {
			if (inFrame !== null && outFrame !== null) {
				return outFrame - inFrame + 1;
			}

			if (inFrame !== null) {
				return config.durationInFrames - inFrame;
			}

			if (outFrame !== null) {
				return outFrame + 1;
			}

			return config.durationInFrames;
		})();

		const stop = () => {
			hasBeenStopped = true;
			playbackChangeTime.current = undefined;
			playbackChangeFrame.current = nextFrame.current;
			if (reqAnimFrameCall !== null) {
				cancelAnimationFrame(reqAnimFrameCall);
			}
		};

		const callback = (now: DOMHighResTimeStamp) => {
			const time =
				playbackChangeTime.current === undefined
					? now - startedTime
					: now - playbackChangeTime.current;
			nextFrame.current = calculateNextFrame({
				time,
				startFrame: playbackChangeFrame.current || startedFrame,
				playbackSpeed: playbackRate,
				fps: config.fps,
				durationInFrames,
			});

			const finalFrame = playbackRate > 0 ? config.durationInFrames : 0;
			if (nextFrame.current === finalFrame && !loop) {
				stop();
				pause();
				emitter.dispatchEnded();
				return;
			}

			const actualNextFrame =
				(nextFrame.current % config.durationInFrames) + (inFrame ?? 0);
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
	]);

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
};
