import type {TimelineContextValue} from 'remotion';
import {ID} from './id.js';

export const makeTimelineContext = (frame: number): TimelineContextValue => {
	return {
		frameRef: {current: frame},
		rootId: '',
		frame: {
			[ID]: frame,
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
