import React, {
	forwardRef,
	MutableRefObject,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react';
import {
	CompositionManagerContext,
	CompProps,
	Internals,
	SetTimelineContextValue,
	TimelineContextValue,
} from 'remotion';
import RootComponent from './RootComponent';

export type PlayerProps<T> = {
	durationInFrames: number;
	width: number;
	height: number;
	fps: number;
	controls?: boolean;
	props?: T;
} & CompProps<T>;

export type PlayerMethods = {
	play: () => void;
	pause: () => void;
};

export const PlayerFn = <T,>(
	{
		durationInFrames,
		height,
		width,
		fps,
		props,
		controls,
		...componentProps
	}: PlayerProps<T>,
	ref: MutableRefObject<PlayerMethods>
) => {
	const component = Internals.useLazyComponent(componentProps);

	const [frame, setFrame] = useState<number>(0);
	const [playing, setPlaying] = useState<boolean>(false);

	useImperativeHandle(ref, () => {
		return {
			play: () => setPlaying(true),
			pause: () => setPlaying(false),
		};
	});

	const timelineContextValue = useMemo((): TimelineContextValue => {
		return {
			frame,
			playing,
			shouldRegisterSequences: true,
		};
	}, [frame, playing]);

	const setTimelineContextValue = useMemo((): SetTimelineContextValue => {
		return {
			setFrame,
			setPlaying,
		};
	}, []);
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
		<Internals.Timeline.TimelineContext.Provider value={timelineContextValue}>
			<Internals.Timeline.SetTimelineContext.Provider
				value={setTimelineContextValue}
			>
				<Internals.CompositionManager.Provider
					value={compositionManagerContext}
				>
					<RootComponent controls={Boolean(controls)} />
				</Internals.CompositionManager.Provider>
			</Internals.Timeline.SetTimelineContext.Provider>
		</Internals.Timeline.TimelineContext.Provider>
	);
};

export type PlayerInstance<T> = React.ForwardRefExoticComponent<
	PlayerProps<T> & React.RefAttributes<PlayerMethods>
>;

// @ts-expect-error
export const Player = forwardRef(PlayerFn) as PlayerInstance;
