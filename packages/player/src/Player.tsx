import React, {
	forwardRef,
	MutableRefObject,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	CompositionManagerContext,
	CompProps,
	Internals,
	MediaVolumeContextValue,
	SetMediaVolumeContextValue,
	SetTimelineContextValue,
	TimelineContextValue,
} from 'remotion';
import {PlayerEventEmitterContext} from './emitter-context';
import {PlayerEmitter} from './event-emitter';
import {PLAYER_CSS_CLASSNAME} from './player-css-classname';
import {PlayerRef} from './player-methods';
import PlayerUI from './PlayerUI';

type PropsIfHasProps<Props> = {} extends Props
	? {
			inputProps?: Props;
	  }
	: {
			inputProps: Props;
	  };

export type PlayerProps<T> = {
	durationInFrames: number;
	compositionWidth: number;
	compositionHeight: number;
	fps: number;
	showVolumeControls?: boolean;
	controls?: boolean;
	style?: React.CSSProperties;
	loop?: boolean;
	autoPlay?: boolean;
	allowFullscreen?: boolean;
	clickToPlay?: boolean;
	inputProps?: unknown;
} & PropsIfHasProps<T> &
	CompProps<T>;

Internals.CSSUtils.injectCSS(
	Internals.CSSUtils.makeDefaultCSS(`.${PLAYER_CSS_CLASSNAME}`)
);

export const PlayerFn = <T,>(
	{
		durationInFrames,
		compositionHeight: height,
		compositionWidth: width,
		fps,
		controls,
		style,
		loop,
		autoPlay,
		showVolumeControls = true,
		allowFullscreen = true,
		inputProps,
		clickToPlay = true,
		...componentProps
	}: PlayerProps<T>,
	ref: MutableRefObject<PlayerRef>
) => {
	const component = Internals.useLazyComponent(componentProps);
	const [frame, setFrame] = useState(0);
	const [playing, setPlaying] = useState<boolean>(false);
	const [rootId] = useState<string>('player-comp');
	const [emitter] = useState(() => new PlayerEmitter());
	const rootRef = useRef<PlayerRef>(null);
	const [mediaMuted, setMediaMuted] = useState<boolean>(false);
	const [mediaVolume, setMediaVolume] = useState<number>(1);

	useImperativeHandle(ref, () => rootRef.current as PlayerRef);

	const timelineContextValue = useMemo((): TimelineContextValue & {
		shouldRegisterSequences: boolean;
	} => {
		return {
			frame,
			playing,
			rootId,
			shouldRegisterSequences: false,
		};
	}, [frame, playing, rootId]);

	const setTimelineContextValue = useMemo((): SetTimelineContextValue => {
		return {
			setFrame,
			setPlaying,
		};
	}, [setFrame]);
	const mediaVolumeContextValue = useMemo((): MediaVolumeContextValue => {
		return {
			mediaMuted,
			mediaVolume,
		};
	}, [mediaMuted, mediaVolume]);

	const setMediaVolumeContextValue = useMemo((): SetMediaVolumeContextValue => {
		return {
			setMediaMuted,
			setMediaVolume,
		};
	}, []);

	const compositionManagerContext: CompositionManagerContext = useMemo(() => {
		return {
			compositions: [
				{
					component: component as React.LazyExoticComponent<
						React.ComponentType<unknown>
					>,
					durationInFrames,
					height,
					width,
					fps,
					id: 'player-comp',
					props: inputProps as unknown,
					nonce: 777,
				},
			],
			currentComposition: 'player-comp',
			registerComposition: () => undefined,
			registerSequence: () => undefined,
			sequences: [],
			setCurrentComposition: () => undefined,
			unregisterComposition: () => undefined,
			unregisterSequence: () => undefined,
			registerAsset: () => undefined,
			unregisterAsset: () => undefined,
			assets: [],
		};
	}, [component, durationInFrames, height, width, fps, inputProps]);

	const passedInputProps = useMemo(() => {
		return inputProps ?? {};
	}, [inputProps]);

	return (
		<Internals.Timeline.TimelineContext.Provider value={timelineContextValue}>
			<Internals.Timeline.SetTimelineContext.Provider
				value={setTimelineContextValue}
			>
				<Internals.CompositionManager.Provider
					value={compositionManagerContext}
				>
					<Internals.MediaVolumeContext.Provider
						value={mediaVolumeContextValue}
					>
						<Internals.SetMediaVolumeContext.Provider
							value={setMediaVolumeContextValue}
						>
							<PlayerEventEmitterContext.Provider value={emitter}>
								<PlayerUI
									ref={rootRef}
									autoPlay={Boolean(autoPlay)}
									loop={Boolean(loop)}
									controls={Boolean(controls)}
									style={style}
									inputProps={passedInputProps}
									allowFullscreen={Boolean(allowFullscreen)}
									clickToPlay={clickToPlay}
									showVolumeControls={showVolumeControls}
									setMediaVolume={setMediaVolume}
									mediaVolume={mediaVolume}
									mediaMuted={mediaMuted}
									setMediaMuted={setMediaMuted}
								/>
							</PlayerEventEmitterContext.Provider>
						</Internals.SetMediaVolumeContext.Provider>
					</Internals.MediaVolumeContext.Provider>
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
