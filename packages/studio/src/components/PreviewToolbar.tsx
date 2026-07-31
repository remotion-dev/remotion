import React, {useCallback, useContext, useState} from 'react';
import {Internals} from 'remotion';
import {checkFullscreenSupport} from '../helpers/check-fullscreen-support';
import {BACKGROUND, BORDER_BLACK_ALPHA_50} from '../helpers/colors';
import {
	useIsStill,
	useIsVideoComposition,
} from '../helpers/is-current-selected-still';
import {useMobileLayout} from '../helpers/mobile-layout';
import {TIMELINE_PADDING} from '../helpers/timeline-layout';
import {loadLoopOption} from '../state/loop';
import {CheckboardToggle} from './CheckboardToggle';
import {FpsCounter} from './FpsCounter';
import {FullScreenToggle} from './FullscreenToggle';
import {Flex, Spacing} from './layout';
import {LoopToggle} from './LoopToggle';
import {MuteToggle} from './MuteToggle';
import {OutlineToggle} from './OutlineToggle';
import {PlaybackKeyboardShortcutsManager} from './PlaybackKeyboardShortcutsManager';
import {PlaybackRatePersistor} from './PlaybackRatePersistor';
import {PlaybackRateSelector} from './PlaybackRateSelector';
import {PlayPause} from './PlayPause';
import {PreviewToolbarOverflowButton} from './PreviewToolbarOverflowButton';
import {RenderButton} from './RenderButton';
import {SizeSelector} from './SizeSelector';
import {SnappingToggle} from './SnappingToggle';
import {TimelineZoomControls} from './Timeline/TimelineZoomControls';
import {TimelineInOutPointToggle} from './TimelineInOutToggle';

const TOOLBAR_HEIGHT = 40;

const container: React.CSSProperties = {
	display: 'flex',
	position: 'relative',
	justifyContent: 'center',
	borderTop: BORDER_BLACK_ALPHA_50,
	alignItems: 'center',
	flexDirection: 'row',
	background: BACKGROUND,
	height: TOOLBAR_HEIGHT,
};

const centeredPlayButton: React.CSSProperties = {
	position: 'absolute',
	left: '50%',
	top: 0,
	height: TOOLBAR_HEIGHT,
	display: 'flex',
	alignItems: 'center',
	transform: 'translateX(-50%)',
};

const sideContainer: React.CSSProperties = {
	width: 300,
	height: 30,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
};

const padding: React.CSSProperties = {
	width: TIMELINE_PADDING,
};

const toolbarControl: React.CSSProperties = {
	display: 'contents',
};

const PreviewToolbarControl: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
		// Prevent deselection of currently selected items
		e.stopPropagation();
	}, []);

	return (
		<div style={toolbarControl} onPointerDown={onPointerDown}>
			{children}
		</div>
	);
};

export const PreviewToolbar: React.FC<{
	readonly readOnlyStudio: boolean;
	readonly bufferStateDelayInMilliseconds: number;
}> = ({readOnlyStudio, bufferStateDelayInMilliseconds}) => {
	const {playbackRate, setPlaybackRate} = Internals.usePlaybackRate();

	const {playerMuted} = useContext(Internals.MediaVolumeContext);
	const {setPlayerMuted} = useContext(Internals.SetMediaVolumeContext);
	const {canvasContent} = useContext(Internals.CompositionManager);
	const isVideoComposition = useIsVideoComposition();

	const isStill = useIsStill();

	const [loop, setLoop] = useState(loadLoopOption());

	const isFullscreenSupported = checkFullscreenSupport();
	const isMobileLayout = useMobileLayout();
	const playPause = (
		<PreviewToolbarControl>
			<PlayPause
				bufferStateDelayInMilliseconds={bufferStateDelayInMilliseconds}
				loop={loop}
				playbackRate={playbackRate}
				muted={playerMuted}
				hideNavigationControls={isMobileLayout}
			/>
		</PreviewToolbarControl>
	);

	return (
		<div style={container} className="css-reset">
			<div style={sideContainer}>
				<div style={padding} />
				<PreviewToolbarControl>
					<TimelineZoomControls />
				</PreviewToolbarControl>
			</div>
			<Flex />
			{isMobileLayout ? null : (
				<PreviewToolbarControl>
					<SizeSelector />
				</PreviewToolbarControl>
			)}
			{!isMobileLayout && (isStill || isVideoComposition) ? (
				<PreviewToolbarControl>
					<PlaybackRateSelector
						setPlaybackRate={setPlaybackRate}
						playbackRate={playbackRate}
					/>
				</PreviewToolbarControl>
			) : null}

			{isVideoComposition && isMobileLayout ? (
				<div style={centeredPlayButton}>{playPause}</div>
			) : null}
			{isVideoComposition && !isMobileLayout ? (
				<>
					<Spacing x={2} />
					{playPause}
					<Spacing x={2} />
					<PreviewToolbarControl>
						<LoopToggle loop={loop} setLoop={setLoop} />
					</PreviewToolbarControl>
					<PreviewToolbarControl>
						<MuteToggle muted={playerMuted} setMuted={setPlayerMuted} />
					</PreviewToolbarControl>
					<Spacing x={2} />
					<PreviewToolbarControl>
						<TimelineInOutPointToggle />
					</PreviewToolbarControl>
					<Spacing x={2} />
				</>
			) : null}
			{canvasContent?.type === 'composition' ? (
				<>
					{isMobileLayout ? null : (
						<PreviewToolbarControl>
							<CheckboardToggle />
						</PreviewToolbarControl>
					)}
					{isMobileLayout ? null : (
						<PreviewToolbarControl>
							<OutlineToggle />
						</PreviewToolbarControl>
					)}
					{readOnlyStudio || isMobileLayout ? null : (
						<PreviewToolbarControl>
							<SnappingToggle />
						</PreviewToolbarControl>
					)}
				</>
			) : null}
			<Spacing x={1} />
			{canvasContent && isFullscreenSupported ? (
				<PreviewToolbarControl>
					<FullScreenToggle hidden={isMobileLayout} />
				</PreviewToolbarControl>
			) : null}
			<Flex />
			<div style={sideContainer}>
				<Flex />
				<FpsCounter playbackSpeed={playbackRate} />
				<Spacing x={2} />
				{isVideoComposition && isMobileLayout ? (
					<PreviewToolbarControl>
						<MuteToggle muted={playerMuted} setMuted={setPlayerMuted} />
					</PreviewToolbarControl>
				) : null}
				<PreviewToolbarControl>
					<RenderButton readOnlyStudio={readOnlyStudio} size="compact" />
				</PreviewToolbarControl>
				{isMobileLayout ? (
					<PreviewToolbarControl>
						<PreviewToolbarOverflowButton
							readOnlyStudio={readOnlyStudio}
							showFullscreen={Boolean(canvasContent && isFullscreenSupported)}
							showPlaybackRate={isVideoComposition}
							showLoop={isVideoComposition}
							showCompositionControls={canvasContent?.type === 'composition'}
							playbackRate={playbackRate}
							setPlaybackRate={setPlaybackRate}
							loop={loop}
							setLoop={setLoop}
						/>
					</PreviewToolbarControl>
				) : null}
				<Spacing x={1.5} />
			</div>
			<PlaybackKeyboardShortcutsManager setPlaybackRate={setPlaybackRate} />
			<PlaybackRatePersistor />
		</div>
	);
};
