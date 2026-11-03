import React, {useCallback, useMemo, useState} from 'react';
import {
	loadShowControlsInFullscreenOption,
	persistShowControlsInFullscreenOption,
	ShowControlsInFullscreenContext,
} from '../state/fullscreen-controls';

export const ShowControlsInFullscreenProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [showControlsInFullscreen, setShowControlsInFullscreenState] = useState(
		() => loadShowControlsInFullscreenOption(),
	);
	const setShowControlsInFullscreen = useCallback(
		(newValue: (prevState: boolean) => boolean) => {
			setShowControlsInFullscreenState((prevState) => {
				const newVal = newValue(prevState);
				persistShowControlsInFullscreenOption(newVal);
				return newVal;
			});
		},
		[],
	);

	const ctx = useMemo(() => {
		return {
			showControlsInFullscreen,
			setShowControlsInFullscreen,
		};
	}, [showControlsInFullscreen, setShowControlsInFullscreen]);

	return (
		<ShowControlsInFullscreenContext.Provider value={ctx}>
			{children}
		</ShowControlsInFullscreenContext.Provider>
	);
};
