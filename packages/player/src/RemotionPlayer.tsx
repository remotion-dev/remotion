import React, {useMemo} from 'react';
import {CompositionManagerContext, CompProps, Internals} from 'remotion';
import RootComponent from './RootComponent';

type Props<T> = {
	durationInFrames: number;
	width: number;
	height: number;
	fps: number;
	props?: T;
} & CompProps<T>;

export const Player = <T,>({
	durationInFrames,
	height,
	width,
	fps,
	props,
	...componentProps
}: Props<T>) => {
	const component = Internals.useLazyComponent(componentProps);

	const compositionManagerContext: CompositionManagerContext = useMemo(() => {
		return {
			compositions: [
				{
					component,
					durationInFrames,
					height,
					width,
					fps,
					id: 'player-comp',
					props,
				},
			],
			currentComposition: 'player-comp',
			registerComposition: () => void 0,
			registerSequence: () => void 0,
			sequences: [],
			setCurrentComposition: () => void 0,
			unregisterComposition: () => void 0,
			unregisterSequence: () => void 0,
		};
	}, [component, props, durationInFrames, fps, height, width]);

	return (
		<Internals.RemotionRoot>
			<Internals.CompositionManager.Provider value={compositionManagerContext}>
				<RootComponent />
			</Internals.CompositionManager.Provider>
		</Internals.RemotionRoot>
	);
};
