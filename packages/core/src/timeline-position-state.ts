import type {MutableRefObject} from 'react';
import {useContext, useMemo} from 'react';
import {
	AbsoluteTimeContext,
	PlaybackRateContext,
	SetTimelineContext,
	TimelineContext,
	type PlaybackRateContextValue,
	type TimelineContextValue,
} from './TimelineContext.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
import {useVideo} from './use-video.js';

export type PlayableMediaTag = {
	play: (reason: string) => void;
	id: string;
};

type CurrentTimePerComposition = Record<string, number>;

const makeKey = () => {
	return `remotion.time-all`;
};

export const persistCurrentFrame = (time: CurrentTimePerComposition) => {
	localStorage.setItem(makeKey(), JSON.stringify(time));
};

export const getInitialFrameState = () => {
	const item = localStorage.getItem(makeKey()) ?? '{}';
	const obj: CurrentTimePerComposition = JSON.parse(item);
	return obj;
};

export const getFrameForComposition = (composition: string) => {
	const item = localStorage.getItem(makeKey()) ?? '{}';
	const obj: CurrentTimePerComposition = JSON.parse(item);

	if (obj[composition] !== undefined) {
		return Number(obj[composition]);
	}

	if (typeof window === 'undefined') {
		return 0;
	}

	return window.remotion_initialFrame ?? 0;
};

const useTimelinePositionFromContext = (
	state: TimelineContextValue,
): number => {
	const videoConfig = useVideo();
	const env = useRemotionEnvironment();

	if (!videoConfig) {
		return typeof window === 'undefined'
			? 0
			: (window.remotion_initialFrame ?? 0);
	}

	const unclamped =
		state.frame[videoConfig.id] ??
		(env.isPlayer ? 0 : getFrameForComposition(videoConfig.id));

	return Math.min(videoConfig.durationInFrames - 1, unclamped);
};

export const useTimelineContext = (): TimelineContextValue => {
	const state = useContext(TimelineContext);
	if (state === null) {
		throw new Error(
			'TimelineContext is not available. This hook must be used inside a <Player> or the Remotion Studio.',
		);
	}

	return state;
};

export const usePlaybackRate = (): PlaybackRateContextValue => {
	const state = useContext(PlaybackRateContext);
	if (state === null) {
		throw new Error(
			'PlaybackRateContext is not available. This hook must be used inside a <Player> or the Remotion Studio.',
		);
	}

	return state;
};

export const useTimelinePosition = (): number => {
	const state = useTimelineContext();
	return useTimelinePositionFromContext(state);
};

export const useAbsoluteTimelinePosition = (): number => {
	const state = useContext(AbsoluteTimeContext);
	if (state === null) {
		throw new Error(
			'AbsoluteTimeContext is not available. This hook must be used inside a <Player> or the Remotion Studio.',
		);
	}

	return useTimelinePositionFromContext(state);
};

export const useTimelineSetFrame = (): ((
	u: React.SetStateAction<Record<string, number>>,
) => void) => {
	const {setFrame} = useContext(SetTimelineContext);
	return setFrame;
};

type PlayingReturnType = readonly [
	boolean,
	(u: React.SetStateAction<boolean>) => void,
	MutableRefObject<boolean>,
];

export const usePlayingState = (): PlayingReturnType => {
	const {playing, imperativePlaying} = useTimelineContext();
	const {setPlaying} = useContext(SetTimelineContext);

	return useMemo(
		() => [playing, setPlaying, imperativePlaying],
		[imperativePlaying, playing, setPlaying],
	);
};
