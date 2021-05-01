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
import {PlayerMethods, PlayerRef} from './player-methods';
import {Controls} from './PlayerControls';
import {useHoverState} from './use-hover-state';
import {usePlayback} from './use-playback';
import {usePlayer} from './use-player';

const RootComponent: React.ForwardRefRenderFunction<
	PlayerRef,
	{
		controls: boolean;
		loop: boolean;
		style?: Omit<React.CSSProperties, 'width' | 'height'>;
	}
> = ({controls, style, loop}, ref) => {
	const config = Internals.useUnsafeVideoConfig();
	const video = Internals.useVideo();
	const container = useRef<HTMLDivElement>(null);
	const hovered = useHoverState(container);
	const [hasPausedToResume, setHasPausedToResume] = useState(false);
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
				setHasPausedToResume(true);
				player.pause();
				player.seek(f);
			},
		};
		return Object.assign(player.emitter, methods);
	});

	const VideoComponent = video ? video.component : null;

	const containerStyle: React.CSSProperties = useMemo(() => {
		if (!config) {
			return {};
		}

		return {
			position: 'relative',
			width: config.width,
			height: config.height,
			overflow: 'hidden',
			...style,
		};
	}, [config, style]);

	const onError = useCallback(
		(error: Error) => {
			player.pause();
			// Pay attention to `this context`
			player.emitter.dispatchError(error);
		},
		[player]
	);
	if (!config) {
		return null;
	}

	return (
		<Suspense fallback={<h1>Loading...</h1>}>
			<div ref={container} style={containerStyle}>
				{VideoComponent ? (
					<ErrorBoundary onError={onError}>
						<VideoComponent {...(((video?.props as unknown) as {}) ?? {})} />
					</ErrorBoundary>
				) : null}
				{controls ? (
					<Controls
						fps={config.fps}
						durationInFrames={config.durationInFrames}
						hovered={hovered}
						player={player}
					/>
				) : null}
			</div>
		</Suspense>
	);
};

export default forwardRef(RootComponent);
