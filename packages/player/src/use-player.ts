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
	slower: () => void;
	faster: () => void;
	pause: () => void;
	seek: (newFrame: number) => void;
	getCurrentFrame: () => number;
	isPlaying: () => boolean;
} => {
	const [playing, setPlaying] = Internals.Timeline.usePlayingState();
	const imperativePlaying = useRef(false);
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
			if (imperativePlaying.current) {
				return;
			}

			if (isLastFrame) {
				seek(0);
			}

			if (audioContext && audioContext.numberOfAudioTags > 0 && e) {
				audioContext.playAllAudios();
			}

			imperativePlaying.current = true;
			setPlaying(true);
			emitter.dispatchPlay();
		},
		[isLastFrame, audioContext, setPlaying, emitter, seek]
	);

	const slower = useCallback(() => {
		emitter.dispatchSlower();
	}, [emitter]);
	const faster = useCallback(() => {
		emitter.dispatchFaster();
	}, [emitter]);

	const pause = useCallback(() => {
		if (imperativePlaying.current) {
			imperativePlaying.current = false;

			setPlaying(false);
			emitter.dispatchPause();
		}
	}, [emitter, setPlaying]);

	const hasVideo = Boolean(video);

	const frameBack = useCallback(
		(frames: number) => {
			if (!hasVideo) {
				return null;
			}

			if (imperativePlaying.current) {
				return;
			}

			setFrame((f) => {
				return Math.max(0, f - frames);
			});
		},
		[hasVideo, setFrame]
	);

	const frameForward = useCallback(
		(frames: number) => {
			if (!hasVideo) {
				return null;
			}

			if (imperativePlaying.current) {
				return;
			}

			setFrame((f) => Math.min(lastFrame, f + frames));
		},
		[hasVideo, lastFrame, setFrame]
	);

	const returnValue = useMemo(() => {
		return {
			frameBack,
			frameForward,
			isLastFrame,
			emitter,
			playing,
			play,
			slower,
			faster,
			pause,
			seek,
			getCurrentFrame: () => frameRef.current as number,
			isPlaying: () => imperativePlaying.current as boolean,
		};
	}, [
		emitter,
		frameBack,
		frameForward,
		isLastFrame,
		pause,
		play,
		slower,
		faster,
		playing,
		seek,
	]);

	return returnValue;
};
