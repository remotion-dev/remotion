import type {TimelineContextValue} from 'remotion';
import {ID} from './id.js';

export const makeTimelineContext = (frame: number): TimelineContextValue => {
	return {
		frame: {
			[ID]: frame,
		},
		isPlaying: () => false,
		isInsideFreeze: false,
		clientAudioOutputFrame: null,
		clientAudioSampleFrame: null,
		clientAudioVideoEnabled: null,
		audioAndVideoTags: {current: []},
	};
};
