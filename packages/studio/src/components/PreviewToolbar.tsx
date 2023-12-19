import React, {useContext, useState} from 'react';
import {Internals} from 'remotion';
import {BACKGROUND} from '../../../../studio/src/helpers/colors';
import {
	useIsStill,
	useIsVideoComposition,
} from '../../../../studio/src/helpers/is-current-selected-still';
import {TIMELINE_PADDING} from '../../../../studio/src/helpers/timeline-layout';
import {loadLoopOption} from '../state/loop';
import {CheckboardToggle} from './CheckboardToggle';
import {FpsCounter} from './FpsCounter';
import {FullScreenToggle} from './FullscreenToggle';
import {Flex, Spacing} from './layout';
import {LoopToggle} from './LoopToggle';
import {MuteToggle} from './MuteToggle';
import {PlaybackKeyboardShortcutsManager} from './PlaybackKeyboardShortcutsManager';
import {PlaybackRatePersistor} from './PlaybackRatePersistor';
import {PlaybackRateSelector} from './PlaybackRateSelector';
import {PlayPause} from './PlayPause';
import {RenderButton} from './RenderButton';
import {SizeSelector} from './SizeSelector';
import {TimelineZoomControls} from './Timeline/TimelineZoomControls';
import {TimelineInOutPointToggle} from './TimelineInOutToggle';

const container: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'center',
	borderTop: '1px solid rgba(0, 0, 0, 0.5)',
	paddingTop: 2,
	paddingBottom: 2,
	alignItems: 'center',
	flexDirection: 'row',
	background: BACKGROUND,
};

const sideContainer: React.CSSProperties = {
	width: 300,
	height: 38,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
};

const padding: React.CSSProperties = {
	width: TIMELINE_PADDING,
};

export const PreviewToolbar: React.FC = () => {
	const {playbackRate, setPlaybackRate} = useContext(
		Internals.Timeline.TimelineContext,
	);

	const {mediaMuted} = useContext(Internals.MediaVolumeContext);
	const {setMediaMuted} = useContext(Internals.SetMediaVolumeContext);
	const isVideoComposition = useIsVideoComposition();
	const isStill = useIsStill();

	const [loop, setLoop] = useState(loadLoopOption());

	const isFullscreenSupported =
		document.fullscreenEnabled || document.webkitFullscreenEnabled;

	return (
		<div style={container} className="css-reset">
			<div style={sideContainer}>
				<div style={padding} />
				<TimelineZoomControls />
			</div>
			<Flex />
			<SizeSelector />
			{isStill || isVideoComposition ? (
				<PlaybackRateSelector
					setPlaybackRate={setPlaybackRate}
					playbackRate={playbackRate}
				/>
			) : null}
			{isVideoComposition ? (
				<>
					<Spacing x={2} />
					<PlayPause loop={loop} playbackRate={playbackRate} />
					<Spacing x={2} />
					<LoopToggle loop={loop} setLoop={setLoop} />
					<MuteToggle muted={mediaMuted} setMuted={setMediaMuted} />
					<Spacing x={2} />
					<TimelineInOutPointToggle />
					<Spacing x={2} />
					<CheckboardToggle />
					<Spacing x={1} />
				</>
			) : null}
			{isFullscreenSupported && <FullScreenToggle />}
			<Flex />
			<div style={sideContainer}>
				<Flex />
				<FpsCounter playbackSpeed={playbackRate} />
				<Spacing x={2} />
				<RenderButton />
				<Spacing x={1.5} />
			</div>
			<PlaybackKeyboardShortcutsManager setPlaybackRate={setPlaybackRate} />
			<PlaybackRatePersistor />
		</div>
	);
};
