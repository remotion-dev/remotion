import type {TimelineContextValue} from 'remotion';

export const makeTimelineContext = (frame: number): TimelineContextValue => {
	return {
		rootId: '',
		frame: {
			'my-comp': frame,
		},
		playing: false,
		imperativePlaying: {
			current: false,
		},
		playbackRate: 1,
		setPlaybackRate: () => {
			throw new Error('playback rate');
		},
		audioAndVideoTags: {current: []},
	};
};
