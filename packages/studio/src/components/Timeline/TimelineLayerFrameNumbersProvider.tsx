import React, {createContext, useEffect, useMemo, useState} from 'react';

const STORAGE_KEY = 'remotion.timelineShowLayerFrameNumbers';

export const TimelineLayerFrameNumbersContext = createContext<{
	showLayerFrameNumbers: boolean;
	setShowLayerFrameNumbers: React.Dispatch<React.SetStateAction<boolean>>;
}>({showLayerFrameNumbers: false, setShowLayerFrameNumbers: () => undefined});

export const TimelineLayerFrameNumbersProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [showLayerFrameNumbers, setShowLayerFrameNumbers] = useState(
		() => localStorage.getItem(STORAGE_KEY) === 'true',
	);
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, String(showLayerFrameNumbers));
	}, [showLayerFrameNumbers]);

	const value = useMemo(
		() => ({showLayerFrameNumbers, setShowLayerFrameNumbers}),
		[showLayerFrameNumbers],
	);

	return (
		<TimelineLayerFrameNumbersContext.Provider value={value}>
			{children}
		</TimelineLayerFrameNumbersContext.Provider>
	);
};
