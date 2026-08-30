import {Internals, type TimelineContextValue} from 'remotion';
import {ID} from './id.js';

export const makeTimelineContext = (frame: number): TimelineContextValue => {
	return {
		frame: {
			[ID]: frame,
		},
		playbackStore: Internals.createRuntimeValueStore({playing: false}),
		audioAndVideoTags: {current: []},
		registerPlaybackListener: () => {},
	};
};
