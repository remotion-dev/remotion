import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Internals} from 'remotion';
import {useIsFullscreen} from '../helpers/use-is-fullscreen';
import {useSyncExternalStore} from '../helpers/use-sync-external-store';
import {drawRef} from '../state/canvas-ref';
import {ShowControlsInFullscreenContext} from '../state/fullscreen-controls';
import {useTimelineInOutFramePosition} from '../state/in-out';

const noop = () => undefined;

const HIDE_AFTER_IDLE_MS = 2000;
const REVEAL_ZONE_HEIGHT = 120;

const FullscreenControlsInner: React.FC<{
	readonly fps: number;
	readonly durationInFrames: number;
}> = ({fps, durationInFrames}) => {
	const {inFrame, outFrame} = useTimelineInOutFramePosition();
	const {play, pause} = PlayerInternals.usePlayerMethods();
	const {subscribePlaying, isPlaying} = useContext(
		Internals.SetTimelineContext,
	);
	const playing = useSyncExternalStore(subscribePlaying, isPlaying, isPlaying);
	const scaleContext = useContext(Internals.CurrentScaleContext);
	const canvasSize =
		scaleContext?.type === 'canvas-size' ? scaleContext.canvasSize : null;

	const toggle = useCallback(() => {
		if (playing) {
			pause();
		} else {
			play();
		}
	}, [pause, play, playing]);

	const exitFullscreen = useCallback(() => {
		document.exitFullscreen();
	}, []);

	const [visible, setVisible] = useState(true);
	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout> | undefined;
		const show = () => {
			setVisible(true);
			clearTimeout(timeout);
			timeout = setTimeout(() => setVisible(false), HIDE_AFTER_IDLE_MS);
		};

		const onPointerMove = (e: PointerEvent) => {
			if (e.clientY >= window.innerHeight - REVEAL_ZONE_HEIGHT) {
				show();
			}
		};

		show();
		window.addEventListener('pointermove', onPointerMove);
		return () => {
			clearTimeout(timeout);
			window.removeEventListener('pointermove', onPointerMove);
		};
	}, []);

	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				bottom: 0,
				opacity: visible ? 1 : 0,
				pointerEvents: visible ? 'auto' : 'none',
				transition: 'opacity 0.3s',
			}}
		>
			<PlayerInternals.PlayerControls
				fps={fps}
				durationInFrames={durationInFrames}
				showVolumeControls
				onFullscreenButtonClick={exitFullscreen}
				isFullscreen
				allowFullscreen
				onExitFullscreenButtonClick={exitFullscreen}
				spaceKeyToPlayOrPause={false}
				onSeekEnd={noop}
				onSeekStart={noop}
				inFrame={inFrame}
				outFrame={outFrame}
				initiallyShowControls
				canvasSize={canvasSize}
				renderPlayPauseButton={null}
				renderFullscreenButton={null}
				alwaysShowControls
				showPlaybackRateControl={false}
				containerRef={drawRef}
				buffering={false}
				hideControlsWhenPointerDoesntMove={false}
				onPointerDown={undefined}
				onDoubleClick={undefined}
				renderMuteButton={null}
				renderVolumeSlider={null}
				playing={playing}
				toggle={toggle}
				renderCustomControls={null}
			/>
		</div>
	);
};

export const FullscreenControls: React.FC = () => {
	const isFullscreen = useIsFullscreen();
	const {showControlsInFullscreen} = useContext(
		ShowControlsInFullscreenContext,
	);
	const config = Internals.useUnsafeVideoConfig();

	if (!isFullscreen || !showControlsInFullscreen || !config) {
		return null;
	}

	return (
		<FullscreenControlsInner
			fps={config.fps}
			durationInFrames={config.durationInFrames}
		/>
	);
};
