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
	PlayableMediaTag,
	SetTimelineContextValue,
	TimelineContextValue,
} from 'remotion';
import {Composition, Internals} from 'remotion';
import type {AnyZodObject} from 'zod';
import {PlayerEventEmitterContext} from './emitter-context.js';
import {PlayerEmitter} from './event-emitter.js';
import {PLAYER_CSS_CLASSNAME} from './player-css-classname.js';
import type {PlayerRef} from './player-methods.js';
import type {
	RenderFullscreenButton,
	RenderPlayPauseButton,
} from './PlayerControls.js';
import type {RenderLoading, RenderPoster} from './PlayerUI.js';
import PlayerUI from './PlayerUI.js';
import {SharedPlayerContexts} from './SharedPlayerContext.js';
import type {PropsIfHasProps} from './utils/props-if-has-props.js';
import {validateInOutFrames} from './utils/validate-in-out-frame.js';
import {validateInitialFrame} from './utils/validate-initial-frame.js';
import {validatePlaybackRate} from './utils/validate-playbackrate.js';

export type ErrorFallback = (info: {error: Error}) => React.ReactNode;

export type PlayerProps<Schema extends AnyZodObject, Props> = {
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
	inFrame?: number | null;
	outFrame?: number | null;
	initiallyShowControls?: number | boolean;
	renderPlayPauseButton?: RenderPlayPauseButton;
	renderFullscreenButton?: RenderFullscreenButton;
	alwaysShowControls?: boolean;
	schema?: Schema;
	initiallyMuted?: boolean;
	showPlaybackRateControl?: boolean | number[];
} & CompProps<Props> &
	PropsIfHasProps<Schema, Props>;

export const componentOrNullIfLazy = <Props,>(
	props: CompProps<Props>
): ComponentType<Props> | null => {
	if ('component' in props) {
		return props.component as ComponentType<Props>;
	}

	return null;
};

const PlayerFn = <Schema extends AnyZodObject, Props>(
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
		inFrame,
		outFrame,
		initiallyShowControls,
		renderFullscreenButton,
		renderPlayPauseButton,
		alwaysShowControls = false,
		initiallyMuted = false,
		showPlaybackRateControl = false,
		...componentProps
	}: PlayerProps<Schema, Props>,
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

	const component = Internals.useLazyComponent(
		componentProps
	) as LazyExoticComponent<ComponentType<unknown>>;

	validateInitialFrame({initialFrame, durationInFrames});

	const [frame, setFrame] = useState(() => initialFrame ?? 0);
	const [playing, setPlaying] = useState<boolean>(false);
	const [rootId] = useState<string>('player-comp');
	const [emitter] = useState(() => new PlayerEmitter());
	const rootRef = useRef<PlayerRef>(null);
	const audioAndVideoTags = useRef<PlayableMediaTag[]>([]);
	const imperativePlaying = useRef(false);
	const [currentPlaybackRate, setCurrentPlaybackRate] = useState(playbackRate);

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
	Internals.validateDurationInFrames({
		durationInFrames,
		component: 'of the <Player/> component',
		allowFloats: false,
	});
	Internals.validateFps(fps, 'as a prop of the <Player/> component', false);
	Internals.validateDefaultAndInputProps(inputProps, 'inputProps', null);

	validateInOutFrames({
		durationInFrames,
		inFrame,
		outFrame,
	});

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

	validatePlaybackRate(currentPlaybackRate);

	useEffect(() => {
		emitter.dispatchRateChange(currentPlaybackRate);
	}, [emitter, currentPlaybackRate]);

	useEffect(() => {
		setCurrentPlaybackRate(playbackRate);
	}, [playbackRate]);

	useImperativeHandle(ref, () => rootRef.current as PlayerRef, []);

	const timelineContextValue = useMemo((): TimelineContextValue & {
		shouldRegisterSequences: boolean;
	} => {
		return {
			frame,
			playing,
			rootId,
			shouldRegisterSequences: false,
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

	const actualInputProps = useMemo(() => inputProps ?? {}, [inputProps]);

	return (
		<Internals.IsPlayerContextProvider>
			<SharedPlayerContexts
				timelineContext={timelineContextValue}
				component={component}
				compositionHeight={compositionHeight}
				compositionWidth={compositionWidth}
				durationInFrames={durationInFrames}
				fps={fps}
				inputProps={actualInputProps}
				numberOfSharedAudioTags={numberOfSharedAudioTags}
				initiallyMuted={initiallyMuted}
			>
				<Internals.Timeline.SetTimelineContext.Provider
					value={setTimelineContextValue}
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
							renderPoster={renderPoster}
							inFrame={inFrame ?? null}
							outFrame={outFrame ?? null}
							initiallyShowControls={initiallyShowControls ?? true}
							renderFullscreen={renderFullscreenButton ?? null}
							renderPlayPauseButton={renderPlayPauseButton ?? null}
							alwaysShowControls={alwaysShowControls}
							showPlaybackRateControl={showPlaybackRateControl}
						/>
					</PlayerEventEmitterContext.Provider>
				</Internals.Timeline.SetTimelineContext.Provider>
			</SharedPlayerContexts>
		</Internals.IsPlayerContextProvider>
	);
};

const forward = forwardRef as <T, P = {}>(
	render: (
		props: P,
		ref: React.MutableRefObject<T>
	) => React.ReactElement | null
) => (props: P & React.RefAttributes<T>) => React.ReactElement | null;

/**
 * @description A component which can be rendered in a regular React App (for example: Create React App, Next.js) to display a Remotion video.
 * @see [Documentation](https://www.remotion.dev/docs/player/player)
 */
export const Player = forward(PlayerFn);
