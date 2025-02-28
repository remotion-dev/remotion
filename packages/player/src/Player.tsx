import type {ComponentType, LazyExoticComponent, MutableRefObject} from 'react';
import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {
	CompProps,
	LogLevel,
	PlayableMediaTag,
	SetTimelineContextValue,
	TimelineContextValue,
} from 'remotion';
import {Composition, Internals} from 'remotion';
import type {AnyZodObject} from 'zod';
import {PlayerEmitterProvider} from './EmitterProvider.js';
import type {RenderMuteButton} from './MediaVolumeSlider.js';
import type {
	RenderFullscreenButton,
	RenderPlayPauseButton,
} from './PlayerControls.js';
import type {PosterFillMode, RenderLoading, RenderPoster} from './PlayerUI.js';
import PlayerUI from './PlayerUI.js';
import {PLAYER_COMP_ID, SharedPlayerContexts} from './SharedPlayerContext.js';
import type {BrowserMediaControlsBehavior} from './browser-mediasession.js';
import {playerCssClassname} from './player-css-classname.js';
import type {PlayerRef} from './player-methods.js';
import type {RenderVolumeSlider} from './render-volume-slider.js';
import {acknowledgeRemotionLicenseMessage} from './use-remotion-license-acknowledge.js';
import type {PropsIfHasProps} from './utils/props-if-has-props.js';
import {validateInOutFrames} from './utils/validate-in-out-frame.js';
import {validateInitialFrame} from './utils/validate-initial-frame.js';
import {validatePlaybackRate} from './utils/validate-playbackrate.js';
import {
	validateDefaultAndInputProps,
	validateDimension,
	validateDurationInFrames,
	validateFps,
} from './validate.js';

export type ErrorFallback = (info: {error: Error}) => React.ReactNode;

export type PlayerProps<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = {
	readonly durationInFrames: number;
	readonly compositionWidth: number;
	readonly compositionHeight: number;
	readonly fps: number;
	readonly showVolumeControls?: boolean;
	readonly controls?: boolean;
	readonly errorFallback?: ErrorFallback;
	readonly style?: React.CSSProperties;
	readonly loop?: boolean;
	readonly autoPlay?: boolean;
	readonly allowFullscreen?: boolean;
	readonly clickToPlay?: boolean;
	readonly doubleClickToFullscreen?: boolean;
	readonly spaceKeyToPlayOrPause?: boolean;
	readonly numberOfSharedAudioTags?: number;
	readonly playbackRate?: number;
	readonly renderLoading?: RenderLoading;
	readonly moveToBeginningWhenEnded?: boolean;
	readonly className?: string;
	readonly initialFrame?: number;
	readonly renderPoster?: RenderPoster;
	readonly showPosterWhenPaused?: boolean;
	readonly showPosterWhenEnded?: boolean;
	readonly showPosterWhenUnplayed?: boolean;
	readonly showPosterWhenBuffering?: boolean;
	readonly inFrame?: number | null;
	readonly outFrame?: number | null;
	readonly initiallyShowControls?: number | boolean;
	readonly renderPlayPauseButton?: RenderPlayPauseButton;
	readonly renderFullscreenButton?: RenderFullscreenButton;
	readonly renderMuteButton?: RenderMuteButton;
	readonly renderVolumeSlider?: RenderVolumeSlider;
	readonly alwaysShowControls?: boolean;
	readonly schema?: Schema;
	readonly initiallyMuted?: boolean;
	readonly showPlaybackRateControl?: boolean | number[];
	readonly posterFillMode?: PosterFillMode;
	readonly bufferStateDelayInMilliseconds?: number;
	readonly hideControlsWhenPointerDoesntMove?: boolean | number;
	readonly overflowVisible?: boolean;
	readonly browserMediaControlsBehavior?: BrowserMediaControlsBehavior;
	readonly overrideInternalClassName?: string;
	readonly logLevel?: LogLevel;
	readonly noSuspense?: boolean;
	readonly acknowledgeRemotionLicense?: boolean;
} & CompProps<Props> &
	PropsIfHasProps<Schema, Props>;

export type PlayerPropsWithoutZod<Props extends Record<string, unknown>> =
	PlayerProps<AnyZodObject, Props>;

export const componentOrNullIfLazy = <Props,>(
	props: CompProps<Props>,
): ComponentType<Props> | null => {
	if ('component' in props) {
		return props.component as ComponentType<Props>;
	}

	return null;
};

const PlayerFn = <
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
>(
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
		showPosterWhenBuffering,
		initialFrame,
		renderPoster,
		inFrame,
		outFrame,
		initiallyShowControls,
		renderFullscreenButton,
		renderPlayPauseButton,
		renderVolumeSlider,
		alwaysShowControls = false,
		initiallyMuted = false,
		showPlaybackRateControl = false,
		posterFillMode = 'player-size',
		bufferStateDelayInMilliseconds,
		hideControlsWhenPointerDoesntMove = true,
		overflowVisible = false,
		renderMuteButton,
		browserMediaControlsBehavior: passedBrowserMediaControlsBehavior,
		overrideInternalClassName,
		logLevel = 'info',
		noSuspense,
		acknowledgeRemotionLicense,
		...componentProps
	}: PlayerProps<Schema, Props>,
	ref: MutableRefObject<PlayerRef>,
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
			'The <Player /> component does not accept `defaultProps`, but some were passed. Use `inputProps` instead.',
		);
	}

	const componentForValidation = componentOrNullIfLazy(
		componentProps,
	) as ComponentType<unknown> | null;

	// @ts-expect-error
	if (componentForValidation?.type === Composition) {
		throw new TypeError(
			`'component' should not be an instance of <Composition/>. Pass the React component directly, and set the duration, fps and dimensions as separate props. See https://www.remotion.dev/docs/player/examples for an example.`,
		);
	}

	if (componentForValidation === Composition) {
		throw new TypeError(
			`'component' must not be the 'Composition' component. Pass your own React component directly, and set the duration, fps and dimensions as separate props. See https://www.remotion.dev/docs/player/examples for an example.`,
		);
	}

	useState(() =>
		acknowledgeRemotionLicenseMessage(
			Boolean(acknowledgeRemotionLicense),
			logLevel,
		),
	);

	const component = Internals.useLazyComponent({
		compProps: componentProps,
		componentName: 'Player',
		noSuspense: Boolean(noSuspense),
	}) as LazyExoticComponent<ComponentType<unknown>>;

	validateInitialFrame({initialFrame, durationInFrames});

	const [frame, setFrame] = useState<Record<string, number>>(() => ({
		[PLAYER_COMP_ID]: initialFrame ?? 0,
	}));
	const [playing, setPlaying] = useState<boolean>(false);
	const [rootId] = useState<string>('player-comp');
	const rootRef = useRef<PlayerRef>(null);
	const audioAndVideoTags = useRef<PlayableMediaTag[]>([]);
	const imperativePlaying = useRef(false);
	const [currentPlaybackRate, setCurrentPlaybackRate] = useState(playbackRate);

	if (typeof compositionHeight !== 'number') {
		throw new TypeError(
			`'compositionHeight' must be a number but got '${typeof compositionHeight}' instead`,
		);
	}

	if (typeof compositionWidth !== 'number') {
		throw new TypeError(
			`'compositionWidth' must be a number but got '${typeof compositionWidth}' instead`,
		);
	}

	validateDimension(
		compositionHeight,
		'compositionHeight',
		'of the <Player /> component',
	);
	validateDimension(
		compositionWidth,
		'compositionWidth',
		'of the <Player /> component',
	);
	validateDurationInFrames(durationInFrames, {
		component: 'of the <Player/> component',
		allowFloats: false,
	});
	validateFps(fps, 'as a prop of the <Player/> component', false);
	validateDefaultAndInputProps(inputProps, 'inputProps', null);

	validateInOutFrames({
		durationInFrames,
		inFrame,
		outFrame,
	});

	if (typeof controls !== 'boolean' && typeof controls !== 'undefined') {
		throw new TypeError(
			`'controls' must be a boolean or undefined but got '${typeof controls}' instead`,
		);
	}

	if (typeof autoPlay !== 'boolean' && typeof autoPlay !== 'undefined') {
		throw new TypeError(
			`'autoPlay' must be a boolean or undefined but got '${typeof autoPlay}' instead`,
		);
	}

	if (typeof loop !== 'boolean' && typeof loop !== 'undefined') {
		throw new TypeError(
			`'loop' must be a boolean or undefined but got '${typeof loop}' instead`,
		);
	}

	if (
		typeof doubleClickToFullscreen !== 'boolean' &&
		typeof doubleClickToFullscreen !== 'undefined'
	) {
		throw new TypeError(
			`'doubleClickToFullscreen' must be a boolean or undefined but got '${typeof doubleClickToFullscreen}' instead`,
		);
	}

	if (
		typeof showVolumeControls !== 'boolean' &&
		typeof showVolumeControls !== 'undefined'
	) {
		throw new TypeError(
			`'showVolumeControls' must be a boolean or undefined but got '${typeof showVolumeControls}' instead`,
		);
	}

	if (
		typeof allowFullscreen !== 'boolean' &&
		typeof allowFullscreen !== 'undefined'
	) {
		throw new TypeError(
			`'allowFullscreen' must be a boolean or undefined but got '${typeof allowFullscreen}' instead`,
		);
	}

	if (typeof clickToPlay !== 'boolean' && typeof clickToPlay !== 'undefined') {
		throw new TypeError(
			`'clickToPlay' must be a boolean or undefined but got '${typeof clickToPlay}' instead`,
		);
	}

	if (
		typeof spaceKeyToPlayOrPause !== 'boolean' &&
		typeof spaceKeyToPlayOrPause !== 'undefined'
	) {
		throw new TypeError(
			`'spaceKeyToPlayOrPause' must be a boolean or undefined but got '${typeof spaceKeyToPlayOrPause}' instead`,
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
			`'numberOfSharedAudioTags' must be an integer but got '${numberOfSharedAudioTags}' instead`,
		);
	}

	validatePlaybackRate(currentPlaybackRate);

	useEffect(() => {
		setCurrentPlaybackRate(playbackRate);
	}, [playbackRate]);

	useImperativeHandle(ref, () => rootRef.current as PlayerRef, []);

	useState(() => {
		Internals.playbackLogging({
			logLevel,
			message: `[player] Mounting <Player>. User agent = ${
				typeof navigator === 'undefined' ? 'server' : navigator.userAgent
			}`,
			tag: 'player',
			mountTime: Date.now(),
		});
	});

	const timelineContextValue = useMemo((): TimelineContextValue => {
		return {
			frame,
			playing,
			rootId,
			playbackRate: currentPlaybackRate,
			imperativePlaying,
			setPlaybackRate: (rate) => {
				setCurrentPlaybackRate(rate);
			},
			audioAndVideoTags,
		};
	}, [frame, currentPlaybackRate, playing, rootId]);

	const setTimelineContextValue = useMemo((): SetTimelineContextValue => {
		return {
			setFrame,
			setPlaying,
		};
	}, [setFrame]);

	if (typeof window !== 'undefined') {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useLayoutEffect(() => {
			// Inject CSS only on client, and also only after the Player has hydrated
			Internals.CSSUtils.injectCSS(
				Internals.CSSUtils.makeDefaultPreviewCSS(
					`.${playerCssClassname(overrideInternalClassName)}`,
					'#fff',
				),
			);
		}, [overrideInternalClassName]);
	}

	const actualInputProps = useMemo(() => inputProps ?? {}, [inputProps]);

	const browserMediaControlsBehavior: BrowserMediaControlsBehavior =
		useMemo(() => {
			return (
				passedBrowserMediaControlsBehavior ?? {
					mode: 'prevent-media-session',
				}
			);
		}, [passedBrowserMediaControlsBehavior]);

	return (
		<Internals.IsPlayerContextProvider>
			<SharedPlayerContexts
				timelineContext={timelineContextValue}
				component={component}
				compositionHeight={compositionHeight}
				compositionWidth={compositionWidth}
				durationInFrames={durationInFrames}
				fps={fps}
				numberOfSharedAudioTags={numberOfSharedAudioTags}
				initiallyMuted={initiallyMuted}
				logLevel={logLevel}
			>
				<Internals.Timeline.SetTimelineContext.Provider
					value={setTimelineContextValue}
				>
					<PlayerEmitterProvider currentPlaybackRate={currentPlaybackRate}>
						<PlayerUI
							ref={rootRef}
							posterFillMode={posterFillMode}
							renderLoading={renderLoading}
							autoPlay={Boolean(autoPlay)}
							loop={Boolean(loop)}
							controls={Boolean(controls)}
							errorFallback={errorFallback}
							style={style}
							inputProps={actualInputProps}
							allowFullscreen={Boolean(allowFullscreen)}
							moveToBeginningWhenEnded={Boolean(moveToBeginningWhenEnded)}
							clickToPlay={
								typeof clickToPlay === 'boolean'
									? clickToPlay
									: Boolean(controls)
							}
							showVolumeControls={Boolean(showVolumeControls)}
							doubleClickToFullscreen={Boolean(doubleClickToFullscreen)}
							spaceKeyToPlayOrPause={Boolean(spaceKeyToPlayOrPause)}
							playbackRate={currentPlaybackRate}
							className={className ?? undefined}
							showPosterWhenUnplayed={Boolean(showPosterWhenUnplayed)}
							showPosterWhenEnded={Boolean(showPosterWhenEnded)}
							showPosterWhenPaused={Boolean(showPosterWhenPaused)}
							showPosterWhenBuffering={Boolean(showPosterWhenBuffering)}
							renderPoster={renderPoster}
							inFrame={inFrame ?? null}
							outFrame={outFrame ?? null}
							initiallyShowControls={initiallyShowControls ?? true}
							renderFullscreen={renderFullscreenButton ?? null}
							renderPlayPauseButton={renderPlayPauseButton ?? null}
							renderMuteButton={renderMuteButton ?? null}
							renderVolumeSlider={renderVolumeSlider ?? null}
							alwaysShowControls={alwaysShowControls}
							showPlaybackRateControl={showPlaybackRateControl}
							bufferStateDelayInMilliseconds={
								bufferStateDelayInMilliseconds ?? 300
							}
							hideControlsWhenPointerDoesntMove={
								hideControlsWhenPointerDoesntMove
							}
							overflowVisible={overflowVisible}
							browserMediaControlsBehavior={browserMediaControlsBehavior}
							overrideInternalClassName={overrideInternalClassName ?? undefined}
							noSuspense={Boolean(noSuspense)}
						/>
					</PlayerEmitterProvider>
				</Internals.Timeline.SetTimelineContext.Provider>
			</SharedPlayerContexts>
		</Internals.IsPlayerContextProvider>
	);
};

const forward = forwardRef as <T, P = {}>(
	render: (
		props: P,
		ref: React.MutableRefObject<T>,
	) => React.ReactElement | null,
) => (props: P & React.RefAttributes<T>) => React.ReactElement | null;

/*
 * @description A component which can be rendered in a regular React App to display a Remotion video.
 * @see [Documentation](https://www.remotion.dev/docs/player/player)
 */
export const Player = forward(PlayerFn);
