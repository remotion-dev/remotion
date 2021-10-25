import {useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import {usePlayer} from './use-player';

const calculateNextFrame = ({
	time,
	startFrame,
	playbackSpeed,
	fps,
	actualLastFrame,
	actualFirstFrame,
	framesAdvanced,
}: {
	time: number;
	startFrame: number;
	playbackSpeed: number;
	fps: number;
	actualFirstFrame: number;
	actualLastFrame: number;
	framesAdvanced: number;
}): {nextFrame: number; framesToAdvance: number} => {
	const op = playbackSpeed < 0 ? Math.ceil : Math.floor;
	const framesToAdvance =
		op((time * playbackSpeed) / (1000 / fps)) - framesAdvanced;

	const nextFrame = framesToAdvance + startFrame;
	if (playbackSpeed > 0) {
		if (nextFrame > actualLastFrame) {
			return {nextFrame: actualFirstFrame, framesToAdvance};
		}

		return {nextFrame, framesToAdvance};
	}

	// Reverse playback
	if (nextFrame < actualFirstFrame) {
		return {nextFrame: actualLastFrame, framesToAdvance};
	}

	return {nextFrame, framesToAdvance};
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

		let hasBeenStopped = false;
		let reqAnimFrameCall: number | null = null;
		const startedTime = performance.now();
		let framesAdvanced = 0;

		const stop = () => {
			hasBeenStopped = true;
			playbackChangeTime.current = undefined;
			if (reqAnimFrameCall !== null) {
				cancelAnimationFrame(reqAnimFrameCall);
			}
		};

		const callback = (now: DOMHighResTimeStamp) => {
			const time = now - startedTime;
			const actualLastFrame = outFrame ?? config.durationInFrames - 1;
			const actualFirstFrame = inFrame ?? 0;

			const {nextFrame, framesToAdvance} = calculateNextFrame({
				time,
				startFrame: frameRef.current,
				playbackSpeed: playbackRate,
				fps: config.fps,
				actualFirstFrame,
				actualLastFrame,
				framesAdvanced,
			});
			framesAdvanced += framesToAdvance;

			const isNextFrameOutside = (() => {
				if (playbackRate > 0) {
					return nextFrame > actualLastFrame;
				}

				// Reverse playback
				return nextFrame < actualFirstFrame;
			})();
			if (isNextFrameOutside && !loop) {
				stop();
				pause();
				emitter.dispatchEnded();
				return;
			}

			if (nextFrame !== frameRef.current) {
				setFrame(nextFrame);
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
