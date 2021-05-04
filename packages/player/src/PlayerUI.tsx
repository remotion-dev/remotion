import React, {
	forwardRef,
	Suspense,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {calculateScale} from './calculate-scale';
import {ErrorBoundary} from './error-boundary';
import {PLAYER_CSS_CLASSNAME} from './player-css-classname';
import {PlayerMethods, PlayerRef} from './player-methods';
import {Controls} from './PlayerControls';
import {useHoverState} from './use-hover-state';
import {usePlayback} from './use-playback';
import {usePlayer} from './use-player';
import {IS_NODE} from './utils/is-node';
import {useElementSize} from './utils/use-element-size';

const PlayerUI: React.ForwardRefRenderFunction<
	PlayerRef,
	{
		controls: boolean;
		loop: boolean;
		autoPlay: boolean;
		allowFullscreen: boolean;
		style?: React.CSSProperties;
	}
> = ({controls, style, loop, autoPlay, allowFullscreen}, ref) => {
	const config = Internals.useUnsafeVideoConfig();
	const video = Internals.useVideo();
	const container = useRef<HTMLDivElement>(null);
	const hovered = useHoverState(container);
	const canvasSize = useElementSize(container);

	const [hasPausedToResume, setHasPausedToResume] = useState(false);
	const [shouldAutoplay, setShouldAutoPlay] = useState(autoPlay);
	const [isFullscreen, setIsFullscreen] = useState(() =>
		IS_NODE ? false : document.fullscreenElement !== null
	);
	usePlayback({loop});
	const player = usePlayer();

	useEffect(() => {
		if (hasPausedToResume && !player.playing) {
			setHasPausedToResume(false);
			player.play();
		}
	}, [hasPausedToResume, player]);

	useEffect(() => {
		const {current} = container;

		if (IS_NODE) {
			return;
		}

		if (!current) {
			return;
		}

		const onFullscreenChange = () => {
			setIsFullscreen(document.fullscreenElement === current);
		};

		document.addEventListener('fullscreenchange', onFullscreenChange);
		return () => {
			document.removeEventListener('fullscreenchange', onFullscreenChange);
		};
	}, []);

	const toggle = useCallback(() => {
		if (player.playing) {
			player.pause();
		} else {
			player.play();
		}
	}, [player]);

	useImperativeHandle(ref, () => {
		const methods: PlayerMethods = {
			play: player.play,
			pause: player.pause,
			toggle,
			getCurrentFrame: player.getCurrentFrame,
			seekTo: (f) => {
				if (player.playing) {
					setHasPausedToResume(true);
					player.pause();
				}

				player.seek(f);
			},
			isFullscreen: () => isFullscreen,
			requestFullscreen: () => requestFullScreenAccess(),
			exitFullscreen: () => document.exitFullscreen(),
		};
		return Object.assign(player.emitter, methods);
	});

	const VideoComponent = video ? video.component : null;

	const outerStyle: React.CSSProperties = useMemo(() => {
		if (!config) {
			return {};
		}

		return {
			position: 'relative',
			overflow: 'hidden',
			width: config.width,
			height: config.height,
			...style,
		};
	}, [config, style]);

	const layout = useMemo(() => {
		if (!config || !canvasSize) {
			return null;
		}

		return calculateScale({
			canvasSize,
			compositionHeight: config.height,
			compositionWidth: config.width,
			previewSize: 'auto',
		});
	}, [canvasSize, config]);

	const outer: React.CSSProperties = useMemo(() => {
		if (!layout || !config) {
			return {};
		}

		const {centerX, centerY, scale} = layout;

		return {
			width: config.width * scale,
			height: config.height * scale,
			display: 'flex',
			flexDirection: 'column',
			position: 'absolute',
			left: centerX,
			top: centerY,
			overflow: 'hidden',
		};
	}, [config, layout]);

	const containerStyle: React.CSSProperties = useMemo(() => {
		if (!config || !canvasSize) {
			return {};
		}

		const {scale, xCorrection, yCorrection} = calculateScale({
			canvasSize,
			compositionHeight: config.height,
			compositionWidth: config.width,
			previewSize: 'auto',
		});

		return {
			position: 'absolute',
			width: config.width,
			height: config.height,
			display: 'flex',
			transform: `scale(${scale})`,
			marginLeft: xCorrection,
			marginTop: yCorrection,
			overflow: 'hidden',
		};
	}, [canvasSize, config]);

	const onError = useCallback(
		(error: Error) => {
			player.pause();
			// Pay attention to `this context`
			player.emitter.dispatchError(error);
		},
		[player]
	);

	const requestFullScreenAccess = useCallback(() => {
		if (!allowFullscreen) {
			throw new Error('allowFullscreen is false');
		}

		if (!document.fullscreenEnabled) {
			throw new Error('Browser doesnt support fullscreen');
		}

		if (!container.current) {
			throw new Error('No player ref found');
		}

		container.current.requestFullscreen();
	}, [allowFullscreen]);

	useEffect(() => {
		if (shouldAutoplay) {
			player.play();
			setShouldAutoPlay(false);
		}
	}, [shouldAutoplay, player]);

	if (!config) {
		return null;
	}

	return (
		<Suspense fallback={<h1>Loading...</h1>}>
			<div ref={container} style={outerStyle}>
				<div style={outer}>
					<div style={containerStyle} className={PLAYER_CSS_CLASSNAME}>
						{VideoComponent ? (
							<ErrorBoundary onError={onError}>
								<VideoComponent
									{...(((video?.props as unknown) as {}) ?? {})}
								/>
							</ErrorBoundary>
						) : null}
					</div>
				</div>
				{controls ? (
					<Controls
						fps={config.fps}
						durationInFrames={config.durationInFrames}
						hovered={hovered}
						player={player}
						requestFullScreenAccess={requestFullScreenAccess}
						isFullscreen={isFullscreen}
						allowFullscreen={allowFullscreen}
					/>
				) : null}
			</div>
		</Suspense>
	);
};

export default forwardRef(PlayerUI);
