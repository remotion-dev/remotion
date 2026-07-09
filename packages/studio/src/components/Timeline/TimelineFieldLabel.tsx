import React, {useMemo} from 'react';
import {WHITE_ALPHA_80} from '../../helpers/colors';
import {getTimelineFieldLabelRowStyle} from './timeline-field-row-layout';
import {
	getTimelineColor,
	getTimelineSelectedLabelStyle,
} from './TimelineSelection';

const fieldNameBase: React.CSSProperties = {
	fontSize: 12,
	color: WHITE_ALPHA_80,
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
			...getTimelineSelectedLabelStyle(selected, true),
			alignSelf: 'stretch',
		}),
		[rowDepth, selected],
	);

	const fieldNameStyle = useMemo(
		(): React.CSSProperties => ({
			...fieldNameBase,
			color: getTimelineColor(selected, true),
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
