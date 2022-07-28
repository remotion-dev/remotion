import React, {createContext, useMemo, useState} from 'react';

export const TIMELINE_MIN_ZOOM = 1;
export const TIMELINE_MAX_ZOOM = 5;

export const TimelineZoomCtx = createContext<{
	zoom: number;
	setZoom: React.Dispatch<React.SetStateAction<number>>;
}>({
	zoom: -1,
	setZoom: () => {
		throw new Error('has no context');
	},
});

export const TimelineZoomContext: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [zoom, setZoom] = useState(TIMELINE_MIN_ZOOM);

	const value = useMemo(() => {
		return {
			zoom,
			setZoom,
		};
	}, [zoom]);

	return (
		<TimelineZoomCtx.Provider value={value}>
			{children}
		</TimelineZoomCtx.Provider>
	);
};
