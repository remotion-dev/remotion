import React, {createContext, useContext} from 'react';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';

const TimelineKeyframeTracksContext = createContext<
	readonly TimelineTrackData[]
>([]);

// Keyframe diamonds need track metadata to resolve other selected rows. The
// selection state only stores identities, and a mounted-row registry would miss
// collapsed or otherwise unmounted rows.
export const TimelineKeyframeTracksProvider: React.FC<{
	readonly tracks: readonly TimelineTrackData[];
	readonly children: React.ReactNode;
}> = ({tracks, children}) => {
	return (
		<TimelineKeyframeTracksContext.Provider value={tracks}>
			{children}
		</TimelineKeyframeTracksContext.Provider>
	);
};

export const useTimelineKeyframeTracks = () => {
	return useContext(TimelineKeyframeTracksContext);
};
