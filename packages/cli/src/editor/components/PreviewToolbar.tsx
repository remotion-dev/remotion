import React, {useContext, useState} from 'react';
import {Internals} from 'remotion';
import {BACKGROUND} from '../helpers/colors';
import {TIMELINE_PADDING} from '../helpers/timeline-layout';
import {loadLoopOption} from '../state/loop';
import {CheckboardToggle} from './CheckboardToggle';
import {FpsCounter} from './FpsCounter';
import {Flex, Spacing} from './layout';
import {LoopToggle} from './LoopToggle';
import {MuteToggle} from './MuteToggle';
import {PlaybackKeyboardShortcutsManager} from './PlaybackKeyboardShortcutsManager';
import {PlaybackRatePersistor} from './PlaybackRatePersistor';
import {PlaybackRateSelector} from './PlaybackRateSelector';
import {PlayPause} from './PlayPause';
import {RichTimelineToggle} from './RichTimelineToggle';
import {SizeSelector} from './SizeSelector';
import {TimelineZoomControls} from './Timeline/TimelineZoomControls';
import {TimelineInOutPointToggle} from './TimelineInOutToggle';
import {TimeValue} from './TimeValue';

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
		Internals.Timeline.TimelineContext
	);

	const {mediaMuted} = useContext(Internals.MediaVolumeContext);
	const {setMediaMuted} = useContext(Internals.SetMediaVolumeContext);

	const [loop, setLoop] = useState(loadLoopOption());

	return (
		<div style={container} className="css-reset">
			<div style={sideContainer}>
				<div style={padding} />
				<TimeValue />
			</div>
			<Flex />
			<SizeSelector />
			<PlaybackRateSelector
				setPlaybackRate={setPlaybackRate}
				playbackRate={playbackRate}
			/>
			<Spacing x={2} />
			<PlayPause loop={loop} playbackRate={playbackRate} />
			<Spacing x={2} />
			<LoopToggle loop={loop} setLoop={setLoop} />
			<CheckboardToggle />
			<RichTimelineToggle />
			<TimelineInOutPointToggle />
			<MuteToggle muted={mediaMuted} setMuted={setMediaMuted} />
			<Flex />
			<div style={sideContainer}>
				<Flex />
				<FpsCounter playbackSpeed={playbackRate} />
				<Spacing x={1} />
				<TimelineZoomControls />
				<div style={padding} />
			</div>
			<PlaybackKeyboardShortcutsManager setPlaybackRate={setPlaybackRate} />
			<PlaybackRatePersistor />
		</div>
	);
};
