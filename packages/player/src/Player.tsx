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

type PropsIfHasProps<Props> = {} extends Props
	? {
			props?: Props;
	  }
	: {
			props: Props;
	  };

export type PlayerProps<T> = {
	durationInFrames: number;
	width: number;
	height: number;
	fps: number;
	controls?: boolean;
	style?: Omit<React.CSSProperties, 'height' | 'width'>;
} & PropsIfHasProps<T> &
	CompProps<T>;

export type PlayerMethods = {
	play: () => void;
	pause: () => void;
	toggle: () => void;
	seekTo: (frame: number) => void;
};

export const PlayerFn = <T,>(
	{
		durationInFrames,
		height,
		width,
		fps,
		props,
		controls,
		style,
		...componentProps
	}: PlayerProps<T>,
	ref: MutableRefObject<PlayerMethods>
) => {
	const component = Internals.useLazyComponent(componentProps);

	const [frame, setFrame] = useState<number>(0);
	const [playing, setPlaying] = useState<boolean>(false);
	const [rootId] = useState<string>('player-comp');

	useImperativeHandle(ref, () => {
		return {
			play: () => setPlaying(true),
			pause: () => setPlaying(false),
			toggle: () => setPlaying(!playing),
			seekTo: (f) => setFrame(f),
		};
	});

	const timelineContextValue = useMemo((): TimelineContextValue & {
		shouldRegisterSequences: boolean;
	} => {
		return {
			frame,
			playing,
			rootId,
			shouldRegisterSequences: true,
		};
	}, [frame, playing, rootId]);

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
					nonce: 777,
				},
			],
			currentComposition: 'player-comp',
			registerComposition: () => void 0,
			registerSequence: () => void 0,
			sequences: [],
			setCurrentComposition: () => void 0,
			unregisterComposition: () => void 0,
			unregisterSequence: () => void 0,
			registerAsset: () => void 0,
			unregisterAsset: () => void 0,
			assets: [],
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
					<RootComponent controls={Boolean(controls)} style={style} />
				</Internals.CompositionManager.Provider>
			</Internals.Timeline.SetTimelineContext.Provider>
		</Internals.Timeline.TimelineContext.Provider>
	);
};

declare module 'react' {
	// eslint-disable-next-line @typescript-eslint/no-shadow
	function forwardRef<T, P = {}>(
		render: (
			props: P,
			ref: React.MutableRefObject<T>
		) => React.ReactElement | null
	): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
}

export const Player = forwardRef(PlayerFn);
