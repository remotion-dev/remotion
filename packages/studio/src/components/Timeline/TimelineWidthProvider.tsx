import {PlayerInternals} from '@remotion/player';
import {createContext, useContext, useLayoutEffect, useState} from 'react';
import {TimelineZoomCtx} from '../../state/timeline-zoom';
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
	const {zoom: zoomMap} = useContext(TimelineZoomCtx);
	const [widthOverride, setWidthOverride] = useState<number | null>(null);

	const observedWidth = size?.width ?? null;

	useLayoutEffect(() => {
		const actual = sliderAreaRef.current?.clientWidth ?? null;
		if (actual !== null && actual !== observedWidth) {
			setWidthOverride(actual);
		} else {
			setWidthOverride(null);
		}
	}, [observedWidth, zoomMap]);

	return (
		<TimelineWidthContext.Provider value={widthOverride ?? observedWidth}>
			{children}
		</TimelineWidthContext.Provider>
	);
};
