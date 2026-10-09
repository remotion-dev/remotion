import React from 'react';
import {ActionTooltip} from '../ActionTooltip';
import {getTimelineColor} from './TimelineSelection';

export const PACKED_LABEL_BOTTOM = 1;
export const timelineSequenceLabelStyle: React.CSSProperties = {
	flex: 1,
	fontSize: 11,
	lineHeight: '15px',
	color: getTimelineColor(false, false),
	maskImage: 'linear-gradient(to right, black calc(100% - 5px), transparent)',
	minWidth: 0,
	// Keep the fade in empty space unless the label is clipped.
	paddingRight: 5,
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	WebkitMaskImage:
		'linear-gradient(to right, black calc(100% - 5px), transparent)',
};

export const TimelineSequenceLabel: React.FC<{
	readonly label: string;
	readonly children: React.ReactNode;
}> = ({label, children}) => {
	return (
		<ActionTooltip
			label={label}
			shortcut={null}
			delay={250}
			dismissOnClick
			triggerStyle={{
				alignSelf: 'flex-start',
				maxWidth: '100%',
				minWidth: 0,
				pointerEvents: 'auto',
			}}
		>
			<span style={timelineSequenceLabelStyle}>{children}</span>
		</ActionTooltip>
	);
};
