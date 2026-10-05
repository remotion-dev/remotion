import React, {createContext, useContext, useRef} from 'react';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';

const TimelineKeyframeTracksContext = createContext<
	React.RefObject<readonly TimelineTrackData[]>
>({current: []});

// Keyframe diamonds need track metadata to resolve other selected rows. The
// selection state only stores identities, and a mounted-row registry would miss
// collapsed or otherwise unmounted rows.
export const TimelineKeyframeTracksProvider: React.FC<{
	readonly tracks: readonly TimelineTrackData[];
	readonly children: React.ReactNode;
}> = ({tracks, children}) => {
	const tracksRef = useRef(tracks);
	tracksRef.current = tracks;

	return (
		<TimelineKeyframeTracksContext.Provider value={tracksRef}>
			{children}
		</TimelineKeyframeTracksContext.Provider>
	);
};

export const useTimelineKeyframeTracksRef = () => {
	return useContext(TimelineKeyframeTracksContext);
};
