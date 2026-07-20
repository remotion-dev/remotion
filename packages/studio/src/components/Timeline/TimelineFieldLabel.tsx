import React, {useContext, useMemo} from 'react';
import {WHITE_ALPHA_80} from '../../helpers/colors';
import {SCHEMA_FIELD_ROW_HEIGHT} from '../../helpers/timeline-layout';
import {getTimelineFieldLabelRowStyle} from './timeline-field-row-layout';
import {TimelineRowLayoutContext} from './TimelineRowLayoutContext';
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
	readonly stacked?: boolean;
}> = ({rowDepth, selected, label, stacked = false}) => {
	const {basePadding} = useContext(TimelineRowLayoutContext);
	const labelRowStyle = useMemo(
		(): React.CSSProperties => ({
			...getTimelineFieldLabelRowStyle(rowDepth, basePadding),
			...getTimelineSelectedLabelStyle(selected, true),
			...(stacked ? {flex: `0 0 ${SCHEMA_FIELD_ROW_HEIGHT}px`} : null),
			alignSelf: 'stretch',
		}),
		[basePadding, rowDepth, selected, stacked],
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
