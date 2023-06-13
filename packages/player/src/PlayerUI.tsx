import type {MouseEventHandler, SyntheticEvent} from 'react';
import React, {
	forwardRef,
	Suspense,
	useCallback,
	useContext,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {
	calculateCanvasTransformation,
	calculateContainerStyle,
	calculateOuter,
	calculateOuterStyle,
} from './calculate-scale.js';
import {ErrorBoundary} from './error-boundary.js';
import {PLAYER_CSS_CLASSNAME} from './player-css-classname.js';
import type {PlayerMethods, PlayerRef} from './player-methods.js';
import type {
	RenderFullscreenButton,
	RenderPlayPauseButton,
} from './PlayerControls.js';
import {Controls} from './PlayerControls.js';
import {useHoverState} from './use-hover-state.js';
import {usePlayback} from './use-playback.js';
import {usePlayer} from './use-player.js';
import {IS_NODE} from './utils/is-node.js';
import {useClickPreventionOnDoubleClick} from './utils/use-click-prevention-on-double-click.js';
import {useElementSize} from './utils/use-element-size.js';

export type ErrorFallback = (info: {error: Error}) => React.ReactNode;
export type RenderLoading = (canvas: {
	height: number;
	width: number;
}) => React.ReactNode;
export type RenderPoster = RenderLoading;
const reactVersion = React.version.split('.')[0];
if (reactVersion === '0') {
	throw new Error(
		`Version ${reactVersion} of "react" is not supported by Remotion`
	);
}

const doesReactVersionSupportSuspense = parseInt(reactVersion, 10) >= 18;

const PlayerUI: React.ForwardRefRenderFunction<
	PlayerRef,
	{
		controls: boolean;
		loop: boolean;
		autoPlay: boolean;
		allowFullscreen: boolean;
		inputProps: Record<string, unknown>;
		showVolumeControls: boolean;
		style?: React.CSSProperties;
		clickToPlay: boolean;
		doubleClickToFullscreen: boolean;
		spaceKeyToPlayOrPause: boolean;
		errorFallback: ErrorFallback;
		playbackRate: number;
		renderLoading: RenderLoading | undefined;
		renderPoster: RenderPoster | undefined;
		className: string | undefined;
		moveToBeginningWhenEnded: boolean;
		showPosterWhenPaused: boolean;
		showPosterWhenEnded: boolean;
		showPosterWhenUnplayed: boolean;
		inFrame: number | null;
		outFrame: number | null;
		initiallyShowControls: number | boolean;
		renderPlayPauseButton: RenderPlayPauseButton | null;
		renderFullscreen: RenderFullscreenButton | null;
		alwaysShowControls: boolean;
		showPlaybackRateControl: boolean | number[];
	}
> = (
	{
		controls,
		style,
		loop,
		autoPlay,
		allowFullscreen,
		inputProps,
		clickToPlay,
		showVolumeControls,
		doubleClickToFullscreen,
		spaceKeyToPlayOrPause,
		errorFallback,
		playbackRate,
		renderLoading,
		renderPoster,
		className,
		moveToBeginningWhenEnded,
		showPosterWhenUnplayed,
		showPosterWhenEnded,
		showPosterWhenPaused,
		inFrame,
		outFrame,
		initiallyShowControls,
		renderFullscreen: renderFullscreenButton,
		renderPlayPauseButton,
		alwaysShowControls,
		showPlaybackRateControl,
	},
	ref
) => {
	const config = Internals.useUnsafeVideoConfig();
	const video = Internals.useVideo();
	const container = useRef<HTMLDivElement>(null);
	const hovered = useHoverState(container);
	const canvasSize = useElementSize(container, {
		triggerOnWindowResize: false,
		shouldApplyCssTransforms: false,
	});

	const [hasPausedToResume, setHasPausedToResume] = useState(false);
	const [shouldAutoplay, setShouldAutoPlay] = useState(autoPlay);
	const [isFullscreen, setIsFullscreen] = useState(() => false);
	const [seeking, setSeeking] = useState(false);

	usePlayback({
		loop,
		playbackRate,
		moveToBeginningWhenEnded,
		inFrame,
		outFrame,
	});
	const player = usePlayer();

	useEffect(() => {
		if (hasPausedToResume && !player.playing) {
			setHasPausedToResume(false);
			player.play();
		}
	}, [hasPausedToResume, player]);

	useEffect(() => {
		const {current} = container;

		if (!current) {
			return;
		}

		const onFullscreenChange = () => {
			setIsFullscreen(
				document.fullscreenElement === current ||
					document.webkitFullscreenElement === current
			);
		};

		document.addEventListener('fullscreenchange', onFullscreenChange);
		document.addEventListener('webkitfullscreenchange', onFullscreenChange);
		return () => {
			document.removeEventListener('fullscreenchange', onFullscreenChange);
			document.removeEventListener(
				'webkitfullscreenchange',
				onFullscreenChange
			);
		};
	}, []);

	const toggle = useCallback(
		(e?: SyntheticEvent) => {
			if (player.isPlaying()) {
				player.pause();
			} else {
				player.play(e);
			}
		},
		[player]
	);

	const requestFullscreen = useCallback(() => {
		if (!allowFullscreen) {
			throw new Error('allowFullscreen is false');
		}

		const supportsFullScreen =
			document.fullscreenEnabled || document.webkitFullscreenEnabled;

		if (!supportsFullScreen) {
			throw new Error('Browser doesnt support fullscreen');
		}

		if (!container.current) {
			throw new Error('No player ref found');
		}

		if (container.current.webkitRequestFullScreen) {
			container.current.webkitRequestFullScreen();
		} else {
			container.current.requestFullscreen();
		}
	}, [allowFullscreen]);

	const exitFullscreen = useCallback(() => {
		if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		} else {
			document.exitFullscreen();
		}
	}, []);

	useEffect(() => {
		const {current} = container;
		if (!current) {
			return;
		}

		const fullscreenChange = () => {
			const element =
				document.webkitFullscreenElement ?? document.fullscreenElement;

			if (element && element === container.current) {
				player.emitter.dispatchFullscreenChange({
					isFullscreen: true,
				});
			} else {
				player.emitter.dispatchFullscreenChange({
					isFullscreen: false,
				});
			}
		};

		current.addEventListener('webkitfullscreenchange', fullscreenChange);
		current.addEventListener('fullscreenchange', fullscreenChange);

		return () => {
			current.removeEventListener('webkitfullscreenchange', fullscreenChange);
			current.removeEventListener('fullscreenchange', fullscreenChange);
		};
	}, [player.emitter]);

	const durationInFrames = config?.durationInFrames ?? 1;

	const layout = useMemo(() => {
		if (!config || !canvasSize) {
			return null;
		}

		return calculateCanvasTransformation({
			canvasSize,
			compositionHeight: config.height,
			compositionWidth: config.width,
			previewSize: 'auto',
		});
	}, [canvasSize, config]);

	const scale = layout?.scale ?? 1;
	const initialScaleIgnored = useRef(false);

	useEffect(() => {
		if (!initialScaleIgnored.current) {
			initialScaleIgnored.current = true;
			return;
		}

		player.emitter.dispatchScaleChange(scale);
	}, [player.emitter, scale]);

	const {setMediaVolume, setMediaMuted} = useContext(
		Internals.SetMediaVolumeContext
	);
	const {mediaMuted, mediaVolume} = useContext(Internals.MediaVolumeContext);
	useEffect(() => {
		player.emitter.dispatchVolumeChange(mediaVolume);
	}, [player.emitter, mediaVolume]);

	const isMuted = mediaMuted || mediaVolume === 0;
	useEffect(() => {
		player.emitter.dispatchMuteChange({
			isMuted,
		});
	}, [player.emitter, isMuted]);

	useImperativeHandle(
		ref,
		() => {
			const methods: PlayerMethods = {
				play: player.play,
				pause: player.pause,
				toggle,
				getContainerNode: () => container.current,
				getCurrentFrame: player.getCurrentFrame,
				isPlaying: () => player.playing,
				seekTo: (f) => {
					const lastFrame = durationInFrames - 1;
					const frameToSeekTo = Math.max(0, Math.min(lastFrame, f));
					if (player.isPlaying()) {
						const pauseToResume = frameToSeekTo !== lastFrame || loop;
						setHasPausedToResume(pauseToResume);
						player.pause();
					}

					if (frameToSeekTo === lastFrame && !loop) {
						player.emitter.dispatchEnded();
					}

					player.seek(frameToSeekTo);
				},
				isFullscreen: () => isFullscreen,
				requestFullscreen,
				exitFullscreen,
				getVolume: () => {
					if (mediaMuted) {
						return 0;
					}

					return mediaVolume;
				},
				setVolume: (vol: number) => {
					if (typeof vol !== 'number') {
						throw new TypeError(
							`setVolume() takes a number, got value of type ${typeof vol}`
						);
					}

					if (isNaN(vol)) {
						throw new TypeError(
							`setVolume() got a number that is NaN. Volume must be between 0 and 1.`
						);
					}

					if (vol < 0 || vol > 1) {
						throw new TypeError(
							`setVolume() got a number that is out of range. Must be between 0 and 1, got ${typeof vol}`
						);
					}

					setMediaVolume(vol);
				},
				isMuted: () => isMuted,
				mute: () => {
					setMediaMuted(true);
				},
				unmute: () => {
					setMediaMuted(false);
				},
				getScale: () => scale,
			};
			return Object.assign(player.emitter, methods);
		},
		[
			durationInFrames,
			exitFullscreen,
			isFullscreen,
			loop,
			mediaMuted,
			isMuted,
			mediaVolume,
			player,
			requestFullscreen,
			setMediaMuted,
			setMediaVolume,
			toggle,
			scale,
		]
	);

	const VideoComponent = video ? video.component : null;

	const outerStyle: React.CSSProperties = useMemo(() => {
		return calculateOuterStyle({canvasSize, config, style});
	}, [canvasSize, config, style]);

	const outer: React.CSSProperties = useMemo(() => {
		return calculateOuter({config, layout, scale});
	}, [config, layout, scale]);

	const containerStyle: React.CSSProperties = useMemo(() => {
		return calculateContainerStyle({canvasSize, config, layout, scale});
	}, [canvasSize, config, layout, scale]);

	const onError = useCallback(
		(error: Error) => {
			player.pause();
			// Pay attention to `this context`
			player.emitter.dispatchError(error);
		},
		[player]
	);

	const onFullscreenButtonClick: MouseEventHandler<HTMLButtonElement> =
		useCallback(
			(e) => {
				e.stopPropagation();
				requestFullscreen();
			},
			[requestFullscreen]
		);

	const onExitFullscreenButtonClick: MouseEventHandler<HTMLButtonElement> =
		useCallback(
			(e) => {
				e.stopPropagation();
				exitFullscreen();
			},
			[exitFullscreen]
		);

	const onSingleClick = useCallback(
		(e: SyntheticEvent) => {
			toggle(e);
		},
		[toggle]
	);

	const onSeekStart = useCallback(() => {
		setSeeking(true);
	}, []);

	const onSeekEnd = useCallback(() => {
		setSeeking(false);
	}, []);

	const onDoubleClick = useCallback(() => {
		if (isFullscreen) {
			exitFullscreen();
		} else {
			requestFullscreen();
		}
	}, [exitFullscreen, isFullscreen, requestFullscreen]);

	const [handleClick, handleDoubleClick] = useClickPreventionOnDoubleClick(
		onSingleClick,
		onDoubleClick,
		doubleClickToFullscreen
	);

	useEffect(() => {
		if (shouldAutoplay) {
			player.play();
			setShouldAutoPlay(false);
		}
	}, [shouldAutoplay, player]);

	const loadingMarkup = useMemo(() => {
		return renderLoading
			? renderLoading({
					height: outerStyle.height as number,
					width: outerStyle.width as number,
			  })
			: null;
	}, [outerStyle.height, outerStyle.width, renderLoading]);

	if (!config) {
		return null;
	}

	const poster = renderPoster
		? renderPoster({
				height: outerStyle.height as number,
				width: outerStyle.width as number,
		  })
		: null;

	if (poster === undefined) {
		throw new TypeError(
			'renderPoster() must return a React element, but undefined was returned'
		);
	}

	const shouldShowPoster =
		poster &&
		[
			showPosterWhenPaused && !player.isPlaying() && !seeking,
			showPosterWhenEnded && player.isLastFrame && !player.isPlaying(),
			showPosterWhenUnplayed && !player.hasPlayed && !player.isPlaying(),
		].some(Boolean);

	const content = (
		<>
			<div
				style={outer}
				onClick={clickToPlay ? handleClick : undefined}
				onDoubleClick={doubleClickToFullscreen ? handleDoubleClick : undefined}
			>
				<div style={containerStyle} className={PLAYER_CSS_CLASSNAME}>
					{VideoComponent ? (
						<ErrorBoundary onError={onError} errorFallback={errorFallback}>
							<VideoComponent
								{...(video?.defaultProps ?? {})}
								{...(inputProps ?? {})}
							/>
						</ErrorBoundary>
					) : null}
				</div>
			</div>
			{shouldShowPoster ? (
				<div
					style={outer}
					onClick={clickToPlay ? handleClick : undefined}
					onDoubleClick={
						doubleClickToFullscreen ? handleDoubleClick : undefined
					}
				>
					{poster}
				</div>
			) : null}
			{controls ? (
				<Controls
					fps={config.fps}
					durationInFrames={config.durationInFrames}
					hovered={hovered}
					player={player}
					onFullscreenButtonClick={onFullscreenButtonClick}
					isFullscreen={isFullscreen}
					allowFullscreen={allowFullscreen}
					showVolumeControls={showVolumeControls}
					onExitFullscreenButtonClick={onExitFullscreenButtonClick}
					spaceKeyToPlayOrPause={spaceKeyToPlayOrPause}
					onSeekEnd={onSeekEnd}
					onSeekStart={onSeekStart}
					inFrame={inFrame}
					outFrame={outFrame}
					initiallyShowControls={initiallyShowControls}
					canvasSize={canvasSize}
					renderFullscreenButton={renderFullscreenButton}
					renderPlayPauseButton={renderPlayPauseButton}
					alwaysShowControls={alwaysShowControls}
					showPlaybackRateControl={showPlaybackRateControl}
				/>
			) : null}
		</>
	);
	if (IS_NODE && !doesReactVersionSupportSuspense) {
		return (
			<div ref={container} style={outerStyle} className={className}>
				{content}
			</div>
		);
	}

	return (
		<div ref={container} style={outerStyle} className={className}>
			<Suspense fallback={loadingMarkup}>{content}</Suspense>
		</div>
	);
};

export default forwardRef(PlayerUI);
