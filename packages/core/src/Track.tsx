import React, {createContext, useMemo, useState} from 'react';

export type TimelineTrack = {
	readonly id: string;
	readonly name: string;
};

export type TimelineTrackItem = TimelineTrack & {
	readonly role: 'clip' | 'container' | 'transition' | 'overlay';
	/** Position in the containing sequence's clock, used for overlay markers. */
	readonly anchor: number | null;
};

export const TimelineTrackContext = createContext<TimelineTrack | null>(null);

export type TrackProps = {
	readonly name: string;
	readonly children: React.ReactNode;
};

/** Groups clips on one Studio timeline row without changing their rendering. */
export const Track: React.FC<TrackProps> = ({name, children}) => {
	const [id] = useState(() => String(Math.random()));
	const value = useMemo(() => ({id, name}), [id, name]);

	return (
		<TimelineTrackContext.Provider value={value}>
			{children}
		</TimelineTrackContext.Provider>
	);
};
