import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useContext} from 'react';
import {Internals} from 'remotion';
import {useIsFullscreen} from '../helpers/use-is-fullscreen';
import {useSyncExternalStore} from '../helpers/use-sync-external-store';
import {drawRef} from '../state/canvas-ref';
import {useTimelineInOutFramePosition} from '../state/in-out';

const noop = () => undefined;

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

	return (
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
			alwaysShowControls={false}
			showPlaybackRateControl={false}
			containerRef={drawRef}
			buffering={false}
			hideControlsWhenPointerDoesntMove
			onPointerDown={undefined}
			onDoubleClick={undefined}
			renderMuteButton={null}
			renderVolumeSlider={null}
			playing={playing}
			toggle={toggle}
			renderCustomControls={null}
		/>
	);
};

export const FullscreenControls: React.FC = () => {
	const isFullscreen = useIsFullscreen();
	const config = Internals.useUnsafeVideoConfig();

	if (!isFullscreen || !config) {
		return null;
	}

	return (
		<FullscreenControlsInner
			fps={config.fps}
			durationInFrames={config.durationInFrames}
		/>
	);
};
