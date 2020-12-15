import React, {useCallback, useMemo, useState} from 'react';
import {
	CompositionManager,
	CompositionManagerContext,
	TComposition,
} from './CompositionManager';
import {
	SetTimelineContext,
	SetTimelineContextValue,
	TimelineContext,
	TimelineContextValue,
} from './timeline-position-state';

export const RemotionRoot: React.FC = ({children}) => {
	// Wontfix, expected to have
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [compositions, setCompositions] = useState<TComposition<any>[]>([]);
	const [currentComposition, setCurrentComposition] = useState<string | null>(
		null
	);
	const [frame, setFrame] = useState<number>(0);
	const [playing, setPlaying] = useState<boolean>(false);

	const registerComposition = useCallback(<T,>(comp: TComposition<T>) => {
		setCompositions((comps) => {
			if (comps.find((c) => c.name === comp.name)) {
				throw new Error(
					`Multiple composition with name ${comp.name} are registered.`
				);
			}
			return [...comps, comp];
		});
	}, []);

	const unregisterComposition = useCallback((name: string) => {
		setCompositions((comps) => {
			return comps.filter((c) => c.name !== name);
		});
	}, []);

	const contextValue = useMemo((): CompositionManagerContext => {
		return {
			compositions,
			registerComposition,
			unregisterComposition,
			currentComposition,
			setCurrentComposition,
		};
	}, [
		compositions,
		currentComposition,
		registerComposition,
		unregisterComposition,
	]);

	const timelineContextValue = useMemo((): TimelineContextValue => {
		return {
			frame,
			playing,
		};
	}, [frame, playing]);

	const setTimelineContextValue = useMemo((): SetTimelineContextValue => {
		return {
			setFrame,
			setPlaying,
		};
	}, []);

	return (
		<TimelineContext.Provider value={timelineContextValue}>
			<SetTimelineContext.Provider value={setTimelineContextValue}>
				<CompositionManager.Provider value={contextValue}>
					{children}
				</CompositionManager.Provider>
			</SetTimelineContext.Provider>
		</TimelineContext.Provider>
	);
};
