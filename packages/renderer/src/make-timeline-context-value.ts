import type {SmallTCompMetadata, TimelineContextValue} from 'remotion';

export const makeTimelineContextValue = (
	composition: SmallTCompMetadata,
	frame: number
) => {
	const value: TimelineContextValue = {
		audioAndVideoTags: {current: []},
		rootId: composition.id,
		playing: false,
		playbackRate: 1,
		imperativePlaying: {
			current: false,
		},
		frame,
		setPlaybackRate: () => {
			throw new Error('Not implemented');
		},
	};

	return value;
};
