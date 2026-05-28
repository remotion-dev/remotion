import React, {useMemo} from 'react';
import {getTimelineFieldLabelRowStyle} from './timeline-field-row-layout';
import {
	getTimelineSelectedLabelStyle,
	TIMELINE_SELECTED_LABEL_TEXT,
} from './TimelineSelection';

const fieldNameBase: React.CSSProperties = {
	fontSize: 12,
	color: 'rgba(255, 255, 255, 0.8)',
	userSelect: 'none',
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	flex: 1,
	minWidth: 0,
};

export const TimelineFieldLabel: React.FC<{
	readonly rowDepth: number;
	readonly selected: boolean;
	readonly label: string;
}> = ({rowDepth, selected, label}) => {
	const labelRowStyle = useMemo(
		(): React.CSSProperties => ({
			...getTimelineFieldLabelRowStyle(rowDepth),
			...getTimelineSelectedLabelStyle(selected),
			alignSelf: 'stretch',
		}),
		[rowDepth, selected],
	);

	const fieldNameStyle = useMemo(
		(): React.CSSProperties => ({
			...fieldNameBase,
			color: selected ? TIMELINE_SELECTED_LABEL_TEXT : fieldNameBase.color,
		}),
		[selected],
	);

	return (
		<div style={labelRowStyle}>
			<span style={fieldNameStyle} title={label}>
				{label}
			</span>
		</div>
	);
};
