import React from 'react';
import type {SchemaFieldInfo} from '../../helpers/timeline-layout';
import {
	timelineFieldValueColumnStyle,
	timelineStackedFieldContentStyle,
} from './timeline-field-row-layout';
import {TimelineFieldLabel} from './TimelineFieldLabel';

export const TimelineFieldRowContent: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly rowDepth: number;
	readonly selected: boolean;
	readonly children: React.ReactNode;
}> = ({field, rowDepth, selected, children}) => {
	const label = (
		<TimelineFieldLabel
			rowDepth={rowDepth}
			selected={selected}
			label={field.description ?? field.key}
			stacked={field.typeName === 'text-content'}
		/>
	);
	const value = <div style={timelineFieldValueColumnStyle}>{children}</div>;

	if (field.typeName === 'text-content') {
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
