import React, {useState} from 'react';
import {TIMELINE_PADDING} from '../helpers/timeline-layout';
import {CheckboardToggle} from './CheckboardToggle';
import {FpsCounter} from './FpsCounter';
import {Flex, Spacing} from './layout';
import {PlaybackKeyboardShortcutsManager} from './PlaybackKeyboardShortcutsManager';
import {PlaybackRateSelector} from './PlaybackRateSelector';
import {PlayPause} from './PlayPause';
import {RichTimelineToggle} from './RichTimelineToggle';
import {SizeSelector} from './SizeSelector';
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
	const [playbackRate, setPlaybackRate] = useState(1);
	const [loop, setLoop] = useState(true);

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
			<CheckboardToggle />
			<RichTimelineToggle />
			<TimelineInOutPointToggle />
			<Flex />
			<div style={sideContainer}>
				<Flex />
				<FpsCounter />
				<div style={padding} />
			</div>
			<PlaybackKeyboardShortcutsManager setPlaybackRate={setPlaybackRate} />
		</div>
	);
};
