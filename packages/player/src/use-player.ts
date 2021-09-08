import {SyntheticEvent, useCallback, useContext, useMemo, useRef} from 'react';
import {Internals} from 'remotion';
import {PlayerEventEmitterContext} from './emitter-context';
import {PlayerEmitter} from './event-emitter';

export const usePlayer = (): {
	frameBack: (frames: number) => void;
	frameForward: (frames: number) => void;
	isLastFrame: boolean;
	emitter: PlayerEmitter;
	playing: boolean;
	play: (e?: SyntheticEvent) => void;
	pause: () => void;
	seek: (newFrame: number) => void;
	getCurrentFrame: () => number;
} => {
	const [playing, setPlaying] = Internals.Timeline.usePlayingState();
	const frame = Internals.Timeline.useTimelinePosition();
	const setFrame = Internals.Timeline.useTimelineSetFrame();
	const setTimelinePosition = Internals.Timeline.useTimelineSetFrame();
	const audioContext = useContext(Internals.SharedAudioContext);

	const frameRef = useRef<number>();
	frameRef.current = frame;
	const video = Internals.useVideo();
	const config = Internals.useUnsafeVideoConfig();
	const emitter = useContext(PlayerEventEmitterContext);

	const lastFrame = (config?.durationInFrames ?? 1) - 1;
	const isLastFrame = frame === lastFrame;

	if (!emitter) {
		throw new TypeError('Expected Player event emitter context');
	}

	const seek = useCallback(
		(newFrame: number) => {
			setTimelinePosition(newFrame);
			emitter.dispatchSeek(newFrame);
		},
		[emitter, setTimelinePosition]
	);

	const play = useCallback(
		(e?: SyntheticEvent) => {
			if (playing) {
				return;
			}

			if (isLastFrame) {
				seek(0);
			}

			if (audioContext && audioContext.numberOfAudioTags > 0 && e) {
				audioContext.playAllAudios();
			}

			setPlaying(true);
			emitter.dispatchPlay();
		},
		[playing, isLastFrame, audioContext, setPlaying, emitter, seek]
	);

	const pause = useCallback(() => {
		if (playing) {
			setPlaying(false);
			emitter.dispatchPause();
		}
	}, [emitter, playing, setPlaying]);

	const hasVideo = Boolean(video);

	const frameBack = useCallback(
		(frames: number) => {
			if (!hasVideo) {
				return null;
			}

			if (playing) {
				return;
			}

			setFrame((f) => {
				return Math.max(0, f - frames);
			});
		},
		[hasVideo, playing, setFrame]
	);

	const frameForward = useCallback(
		(frames: number) => {
			if (!hasVideo) {
				return null;
			}

			if (playing) {
				return;
			}

			setFrame((f) => Math.min(lastFrame, f + frames));
		},
		[hasVideo, lastFrame, playing, setFrame]
	);

	const returnValue = useMemo(() => {
		return {
			frameBack,
			frameForward,
			isLastFrame,
			emitter,
			playing,
			play,
			pause,
			seek,
			getCurrentFrame: () => frameRef.current as number,
		};
	}, [
		emitter,
		frameBack,
		frameForward,
		isLastFrame,
		pause,
		play,
		playing,
		seek,
	]);

	return returnValue;
};
