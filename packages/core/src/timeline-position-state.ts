import type {MutableRefObject} from 'react';
import {createContext, useContext, useMemo} from 'react';
import {useVideo} from './use-video.js';

export type PlayableMediaTag = {
	play: () => void;
	id: string;
};

export type TimelineContextValue = {
	frame: number;
	playing: boolean;
	rootId: string;
	playbackRate: number;
	imperativePlaying: MutableRefObject<boolean>;
	setPlaybackRate: (u: React.SetStateAction<number>) => void;
	audioAndVideoTags: MutableRefObject<PlayableMediaTag[]>;
};

export type SetTimelineContextValue = {
	setFrame: (u: React.SetStateAction<number>) => void;
	setPlaying: (u: React.SetStateAction<boolean>) => void;
};

export const TimelineContext = createContext<TimelineContextValue>({
	frame: 0,
	playing: false,
	playbackRate: 1,
	rootId: '',
	imperativePlaying: {
		current: false,
	},
	setPlaybackRate: () => {
		throw new Error('default');
	},
	audioAndVideoTags: {current: []},
});

export const SetTimelineContext = createContext<SetTimelineContextValue>({
	setFrame: () => {
		throw new Error('default');
	},
	setPlaying: () => {
		throw new Error('default');
	},
});

export const useTimelinePosition = (): number => {
	const videoConfig = useVideo();
	const state = useContext(TimelineContext);

	// A dynamically calculated duration using calculateMetadata()
	// may lead to the frame being bigger than the duration.
	// If we have the config, we clamp the frame to the duration.
	if (!videoConfig) {
		return state.frame;
	}

	return Math.min(videoConfig.durationInFrames - 1, state.frame);
};

export const useTimelineSetFrame = (): ((
	u: React.SetStateAction<number>
) => void) => {
	const {setFrame} = useContext(SetTimelineContext);
	return setFrame;
};

type PlayingReturnType = readonly [
	boolean,
	(u: React.SetStateAction<boolean>) => void,
	MutableRefObject<boolean>
];

export const usePlayingState = (): PlayingReturnType => {
	const {playing, imperativePlaying} = useContext(TimelineContext);
	const {setPlaying} = useContext(SetTimelineContext);

	return useMemo(
		() => [playing, setPlaying, imperativePlaying],
		[imperativePlaying, playing, setPlaying]
	);
};
