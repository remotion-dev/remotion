import React from 'react';
import {TIMELINE_PADDING} from '../helpers/timeline-layout';
import {CheckboardToggle} from './CheckboardToggle';
import {FpsCounter} from './FpsCounter';
import {Flex} from './layout';
import {PlayPause} from './PlayPause';
import {RichTimelineToggle} from './RichTimelineToggle';
import {SizeSelector} from './SizeSelector';
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
	return (
		<div style={container}>
			<div style={sideContainer}>
				<div style={padding} />
				<TimeValue />
			</div>
			<Flex />
			<SizeSelector />
			<PlayPause />
			<CheckboardToggle />
			<RichTimelineToggle />
			<Flex />
			<div style={sideContainer}>
				<Flex />
				<FpsCounter />
				<div style={padding} />
			</div>
		</div>
	);
};
