import {PlayerInternals} from '@remotion/player';
import {createContext} from 'react';
import {sliderAreaRef} from './timeline-refs';

type TimelineWidthContextType = number | null;

export const TimelineWidthContext =
	createContext<TimelineWidthContextType>(null);

export const TimelineWidthProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const size = PlayerInternals.useElementSize(sliderAreaRef, {
		triggerOnWindowResize: false,
		shouldApplyCssTransforms: true,
	});

	return (
		<TimelineWidthContext.Provider value={size?.width ?? null}>
			{children}
		</TimelineWidthContext.Provider>
	);
};
