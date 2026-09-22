import React, {createContext, useEffect, useMemo, useState} from 'react';

const STORAGE_KEY = 'remotion.timelineShowFrames';

export const TimelineTickFormatContext = createContext<{
	showFrames: boolean;
	setShowFrames: React.Dispatch<React.SetStateAction<boolean>>;
}>({showFrames: false, setShowFrames: () => undefined});

export const TimelineTickFormatProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [showFrames, setShowFrames] = useState(
		() => localStorage.getItem(STORAGE_KEY) === 'true',
	);
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, String(showFrames));
	}, [showFrames]);

	const value = useMemo(() => ({showFrames, setShowFrames}), [showFrames]);
	return (
		<TimelineTickFormatContext.Provider value={value}>
			{children}
		</TimelineTickFormatContext.Provider>
	);
};
