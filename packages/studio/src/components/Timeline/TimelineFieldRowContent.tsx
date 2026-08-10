import React, {useContext} from 'react';
import type {SchemaFieldInfo} from '../../helpers/timeline-layout';
import {
	isTimelineFieldStacked,
	timelineFieldValueColumnStyle,
	timelineStackedFieldContentStyle,
} from './timeline-field-row-layout';
import {TimelineFieldLabel} from './TimelineFieldLabel';
import {Transform3DModeContext} from './Transform3DModeContext';

export const TimelineFieldRowContent: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly rowDepth: number;
	readonly selected: boolean;
	readonly children: React.ReactNode;
}> = ({field, rowDepth, selected, children}) => {
	const transform3DMode = useContext(Transform3DModeContext);
	const stacked = isTimelineFieldStacked({field, transform3DMode});
	const label = (
		<TimelineFieldLabel
			rowDepth={rowDepth}
			selected={selected}
			label={field.description ?? field.key}
			stacked={stacked}
		/>
	);
	const value = <div style={timelineFieldValueColumnStyle}>{children}</div>;

	if (stacked) {
		return (
			<div style={timelineStackedFieldContentStyle}>
				{label}
				{value}
			</div>
		);
	}

	return (
		<>
			{label}
			{value}
		</>
	);
};
