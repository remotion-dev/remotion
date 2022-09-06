import type {ComponentType, MutableRefObject} from 'react';
import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {
	CompositionManagerContext,
	CompProps,
	MediaVolumeContextValue,
	PlayableMediaTag,
	SetMediaVolumeContextValue,
	SetTimelineContextValue,
	TimelineContextValue,
} from 'remotion';
import {Composition, Internals} from 'remotion';
import {PlayerEventEmitterContext} from './emitter-context';
import {PlayerEmitter} from './event-emitter';
import {PLAYER_CSS_CLASSNAME} from './player-css-classname';
import type {PlayerRef} from './player-methods';
import type {RenderLoading, RenderPoster} from './PlayerUI';
import PlayerUI from './PlayerUI';
import {validateInitialFrame} from './utils/validate-initial-frame';
import {validatePlaybackRate} from './utils/validate-playbackrate';
import {getPreferredVolume, persistVolume} from './volume-persistance';

type PropsIfHasProps<Props> = {} extends Props
	? {
			inputProps?: Props;
	  }
	: {
			inputProps: Props;
	  };

export type ErrorFallback = (info: {error: Error}) => React.ReactNode;

export type PlayerProps<T> = {
	durationInFrames: number;
	compositionWidth: number;
	compositionHeight: number;
	fps: number;
	showVolumeControls?: boolean;
	controls?: boolean;
	errorFallback?: ErrorFallback;
	style?: React.CSSProperties;
	loop?: boolean;
	autoPlay?: boolean;
	allowFullscreen?: boolean;
	clickToPlay?: boolean;
	doubleClickToFullscreen?: boolean;
	spaceKeyToPlayOrPause?: boolean;
	numberOfSharedAudioTags?: number;
	playbackRate?: number;
	renderLoading?: RenderLoading;
	moveToBeginningWhenEnded?: boolean;
	className?: string;
	initialFrame?: number;
	renderPoster?: RenderPoster;
	showPosterWhenPaused?: boolean;
	showPosterWhenEnded?: boolean;
	showPosterWhenUnplayed?: boolean;
} & PropsIfHasProps<T> &
	CompProps<T>;

export const componentOrNullIfLazy = <T,>(
	props: CompProps<T>
): ComponentType<T> | null => {
	if ('component' in props) {
		return props.component as ComponentType<T>;
	}

	return null;
};

export const PlayerFn = <T,>(
	{
		durationInFrames,
		compositionHeight,
		compositionWidth,
		fps,
		inputProps,
		style,
		controls = false,
		loop = false,
		autoPlay = false,
		showVolumeControls = true,
		allowFullscreen = true,
		clickToPlay,
		doubleClickToFullscreen = false,
		spaceKeyToPlayOrPause = true,
		moveToBeginningWhenEnded = true,
		numberOfSharedAudioTags = 5,
		errorFallback = () => '⚠️',
		playbackRate = 1,
		renderLoading,
		className,
		showPosterWhenUnplayed,
		showPosterWhenEnded,
		showPosterWhenPaused,
		initialFrame,
		renderPoster,
		...componentProps
	}: PlayerProps<T>,
	ref: MutableRefObject<PlayerRef>
) => {
	if (typeof window !== 'undefined') {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useLayoutEffect(() => {
			window.remotion_isPlayer = true;
		}, []);
	}

	// @ts-expect-error
	if (componentProps.defaultProps !== undefined) {
		throw new Error(
			'The <Player /> component does not accept `defaultProps`, but some were passed. Use `inputProps` instead.'
		);
	}

	const componentForValidation = componentOrNullIfLazy(
		componentProps
	) as ComponentType<unknown> | null;

	// @ts-expect-error
	if (componentForValidation?.type === Composition) {
		throw new TypeError(
			`'component' should not be an instance of <Composition/>. Pass the React component directly, and set the duration, fps and dimensions as separate props. See https://www.remotion.dev/docs/player/examples for an example.`
		);
	}

	if (componentForValidation === Composition) {
		throw new TypeError(
			`'component' must not be the 'Composition' component. Pass your own React component directly, and set the duration, fps and dimensions as separate props. See https://www.remotion.dev/docs/player/examples for an example.`
		);
	}

	const component = Internals.useLazyComponent(componentProps);

	validateInitialFrame({initialFrame, durationInFrames});
	const [frame, setFrame] = useState(() => initialFrame ?? 0);
	const [playing, setPlaying] = useState<boolean>(false);
	const [rootId] = useState<string>('player-comp');
	const [emitter] = useState(() => new PlayerEmitter());
	const rootRef = useRef<PlayerRef>(null);
	const [mediaMuted, setMediaMuted] = useState<boolean>(false);
	const [mediaVolume, setMediaVolume] = useState<number>(getPreferredVolume());
	const audioAndVideoTags = useRef<PlayableMediaTag[]>([]);
	const imperativePlaying = useRef(false);

	if (typeof compositionHeight !== 'number') {
		throw new TypeError(
			`'compositionHeight' must be a number but got '${typeof compositionHeight}' instead`
		);
	}

	if (typeof compositionWidth !== 'number') {
		throw new TypeError(
			`'compositionWidth' must be a number but got '${typeof compositionWidth}' instead`
		);
	}

	Internals.validateDimension(
		compositionHeight,
		'compositionHeight',
		'of the <Player /> component'
	);
	Internals.validateDimension(
		compositionWidth,
		'compositionWidth',
		'of the <Player /> component'
	);
	Internals.validateDurationInFrames(
		durationInFrames,
		'of the <Player/> component'
	);
	Internals.validateFps(fps, 'as a prop of the <Player/> component', false);

	if (typeof controls !== 'boolean' && typeof controls !== 'undefined') {
		throw new TypeError(
			`'controls' must be a boolean or undefined but got '${typeof controls}' instead`
		);
	}

	if (typeof autoPlay !== 'boolean' && typeof autoPlay !== 'undefined') {
		throw new TypeError(
			`'autoPlay' must be a boolean or undefined but got '${typeof autoPlay}' instead`
		);
	}

	if (typeof loop !== 'boolean' && typeof loop !== 'undefined') {
		throw new TypeError(
			`'loop' must be a boolean or undefined but got '${typeof loop}' instead`
		);
	}

	if (
		typeof doubleClickToFullscreen !== 'boolean' &&
		typeof doubleClickToFullscreen !== 'undefined'
	) {
		throw new TypeError(
			`'doubleClickToFullscreen' must be a boolean or undefined but got '${typeof doubleClickToFullscreen}' instead`
		);
	}

	if (
		typeof showVolumeControls !== 'boolean' &&
		typeof showVolumeControls !== 'undefined'
	) {
		throw new TypeError(
			`'showVolumeControls' must be a boolean or undefined but got '${typeof showVolumeControls}' instead`
		);
	}

	if (
		typeof allowFullscreen !== 'boolean' &&
		typeof allowFullscreen !== 'undefined'
	) {
		throw new TypeError(
			`'allowFullscreen' must be a boolean or undefined but got '${typeof allowFullscreen}' instead`
		);
	}

	if (typeof clickToPlay !== 'boolean' && typeof clickToPlay !== 'undefined') {
		throw new TypeError(
			`'clickToPlay' must be a boolean or undefined but got '${typeof clickToPlay}' instead`
		);
	}

	if (
		typeof spaceKeyToPlayOrPause !== 'boolean' &&
		typeof spaceKeyToPlayOrPause !== 'undefined'
	) {
		throw new TypeError(
			`'spaceKeyToPlayOrPause' must be a boolean or undefined but got '${typeof spaceKeyToPlayOrPause}' instead`
		);
	}

	if (
		typeof numberOfSharedAudioTags !== 'number' ||
		numberOfSharedAudioTags % 1 !== 0 ||
		!Number.isFinite(numberOfSharedAudioTags) ||
		Number.isNaN(numberOfSharedAudioTags) ||
		numberOfSharedAudioTags < 0
	) {
		throw new TypeError(
			`'numberOfSharedAudioTags' must be an integer but got '${numberOfSharedAudioTags}' instead`
		);
	}

	validatePlaybackRate(playbackRate);

	useEffect(() => {
		emitter.dispatchRatechange(playbackRate);
	}, [emitter, playbackRate]);

	const setMediaVolumeAndPersist = useCallback((vol: number) => {
		setMediaVolume(vol);
		persistVolume(vol);
	}, []);

	useImperativeHandle(ref, () => rootRef.current as PlayerRef);

	const timelineContextValue = useMemo((): TimelineContextValue & {
		shouldRegisterSequences: boolean;
	} => {
		return {
			frame,
			playing,
			rootId,
			shouldRegisterSequences: false,
			playbackRate,
			imperativePlaying,
			setPlaybackRate: () => {
				throw new Error('playback rate');
			},
			audioAndVideoTags,
		};
	}, [frame, playbackRate, playing, rootId]);

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
			setMediaVolume: setMediaVolumeAndPersist,
		};
	}, [setMediaVolumeAndPersist]);

	const compositionManagerContext: CompositionManagerContext = useMemo(() => {
		return {
			compositions: [
				{
					component: component as React.LazyExoticComponent<
						ComponentType<unknown>
					>,
					durationInFrames,
					height: compositionHeight,
					width: compositionWidth,
					fps,
					id: 'player-comp',
					props: inputProps as unknown,
					nonce: 777,
					scale: 1,
					folderName: null,
					defaultProps: undefined,
					parentFolderName: null,
				},
			],
			folders: [],
			registerFolder: () => undefined,
			unregisterFolder: () => undefined,
			currentComposition: 'player-comp',
			registerComposition: () => undefined,
			registerSequence: () => undefined,
			sequences: [],
			setCurrentComposition: () => undefined,
			unregisterComposition: () => undefined,
			unregisterSequence: () => undefined,
			registerAsset: () => undefined,
			unregisterAsset: () => undefined,
			currentCompositionMetadata: null,
			setCurrentCompositionMetadata: () => undefined,
			assets: [],
		};
	}, [
		component,
		durationInFrames,
		compositionHeight,
		compositionWidth,
		fps,
		inputProps,
	]);

	const passedInputProps = useMemo(() => {
		return inputProps ?? {};
	}, [inputProps]);

	if (typeof window !== 'undefined') {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useLayoutEffect(() => {
			// Inject CSS only on client, and also only after the Player has hydrated
			Internals.CSSUtils.injectCSS(
				Internals.CSSUtils.makeDefaultCSS(`.${PLAYER_CSS_CLASSNAME}`, '#fff')
			);
		}, []);
	}

	return (
		<Internals.CanUseRemotionHooksProvider>
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
								<Internals.SharedAudioContextProvider
									numberOfAudioTags={numberOfSharedAudioTags}
								>
									<PlayerEventEmitterContext.Provider value={emitter}>
										<PlayerUI
											ref={rootRef}
											renderLoading={renderLoading}
											autoPlay={Boolean(autoPlay)}
											loop={Boolean(loop)}
											controls={Boolean(controls)}
											errorFallback={errorFallback}
											style={style}
											inputProps={passedInputProps}
											allowFullscreen={Boolean(allowFullscreen)}
											moveToBeginningWhenEnded={Boolean(
												moveToBeginningWhenEnded
											)}
											clickToPlay={
												typeof clickToPlay === 'boolean'
													? clickToPlay
													: Boolean(controls)
											}
											showVolumeControls={Boolean(showVolumeControls)}
											setMediaVolume={setMediaVolumeAndPersist}
											mediaVolume={mediaVolume}
											mediaMuted={mediaMuted}
											doubleClickToFullscreen={Boolean(doubleClickToFullscreen)}
											setMediaMuted={setMediaMuted}
											spaceKeyToPlayOrPause={Boolean(spaceKeyToPlayOrPause)}
											playbackRate={playbackRate}
											className={className ?? undefined}
											showPosterWhenUnplayed={Boolean(showPosterWhenUnplayed)}
											showPosterWhenEnded={Boolean(showPosterWhenEnded)}
											showPosterWhenPaused={Boolean(showPosterWhenPaused)}
											renderPoster={renderPoster}
										/>
									</PlayerEventEmitterContext.Provider>
								</Internals.SharedAudioContextProvider>
							</Internals.SetMediaVolumeContext.Provider>
						</Internals.MediaVolumeContext.Provider>
					</Internals.CompositionManager.Provider>
				</Internals.Timeline.SetTimelineContext.Provider>
			</Internals.Timeline.TimelineContext.Provider>
		</Internals.CanUseRemotionHooksProvider>
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
