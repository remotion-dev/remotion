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
import {ErrorBoundary} from './error-boundary';
import {PLAYER_CSS_CLASSNAME} from './player-css-classname';
import {PlayerMethods, PlayerRef} from './player-methods';
import {Controls} from './PlayerControls';
import {useHoverState} from './use-hover-state';
import {usePlayback} from './use-playback';
import {usePlayer} from './use-player';
import {useElementSize} from './utils/use-element-size';

const PlayerUI: React.ForwardRefRenderFunction<
	PlayerRef,
	{
		controls: boolean;
		loop: boolean;
		autoPlay: boolean;
		style?: React.CSSProperties;
		id: string;
	}
> = ({controls, style, loop, autoPlay, id}, ref) => {
	const config = Internals.useUnsafeVideoConfig();
	const video = Internals.useVideo();
	const container = useRef<HTMLDivElement>(null);
	const hovered = useHoverState(container);
	const canvasSize = useElementSize(container);

	const [hasPausedToResume, setHasPausedToResume] = useState(false);
	const [shouldAutoplay, setShouldAutoPlay] = useState(autoPlay);
	usePlayback({loop});
	const player = usePlayer();

	useEffect(() => {
		if (hasPausedToResume && !player.playing) {
			setHasPausedToResume(false);
			player.play();
		}
	}, [hasPausedToResume, player]);

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

	const containerStyle: React.CSSProperties = useMemo(() => {
		if (!config) {
			return {};
		}

		return {
			position: 'relative',
			width: '100%',
			height: '100%',
			overflow: 'hidden',
		};
	}, [config]);

	const onError = useCallback(
		(error: Error) => {
			player.pause();
			// Pay attention to `this context`
			player.emitter.dispatchError(error);
		},
		[player]
	);

	const requestFullScreenAccess = () => {
		const divElement = document.getElementById(id);
		if (divElement) {
			divElement.requestFullscreen();
		}
	};

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
			<div ref={container} id={id} style={outerStyle}>
				<div style={containerStyle} id={id} className={PLAYER_CSS_CLASSNAME}>
					{VideoComponent ? (
						<ErrorBoundary onError={onError}>
							<VideoComponent {...(((video?.props as unknown) as {}) ?? {})} />
						</ErrorBoundary>
					) : null}
				</div>
				{controls ? (
					<Controls
						fps={config.fps}
						durationInFrames={config.durationInFrames}
						hovered={hovered}
						player={player}
						requestFullScreenAccess={requestFullScreenAccess}
					/>
				) : null}
			</div>
		</Suspense>
	);
};

export default forwardRef(PlayerUI);
