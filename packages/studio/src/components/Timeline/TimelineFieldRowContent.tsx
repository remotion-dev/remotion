import React, {useContext} from 'react';
import {
	SCHEMA_FIELD_ROW_HEIGHT,
	type SchemaFieldInfo,
} from '../../helpers/timeline-layout';
import {
	isTimelineFieldStacked,
	timelineCompactStackedFieldValueColumnStyle,
	timelineFieldValueColumnStyle,
	timelineStackedFieldContentStyle,
} from './timeline-field-row-layout';
import {TimelineFieldLabel} from './TimelineFieldLabel';
import {TimelineRowKeyframeControlsColumn} from './TimelineRowChrome';
import {TimelineRowLayoutContext} from './TimelineRowLayoutContext';
import {Transform3DModeContext} from './Transform3DModeContext';

const stackedHeaderStyle: React.CSSProperties = {
	display: 'flex',
	flex: `0 0 ${SCHEMA_FIELD_ROW_HEIGHT}px`,
	minWidth: 0,
};

const stackedLabelStyle: React.CSSProperties = {
	flex: 1,
	minWidth: 0,
};

export const TimelineFieldRowContent: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly rowDepth: number;
	readonly selected: boolean;
	readonly keyframeControls: React.ReactNode;
	readonly children: React.ReactNode;
}> = ({field, rowDepth, selected, keyframeControls, children}) => {
	const transform3DMode = useContext(Transform3DModeContext);
	const {keyframeControlsPlacement} = useContext(TimelineRowLayoutContext);
	const stacked = isTimelineFieldStacked({field, transform3DMode});
	const compactStacked = stacked && field.typeName !== 'text-content';
	const label = (
		<TimelineFieldLabel
			rowDepth={rowDepth}
			selected={selected}
			label={field.description ?? field.key}
			stacked={stacked}
		/>
	);
	const value = (
		<div
			style={
				compactStacked
					? timelineCompactStackedFieldValueColumnStyle
					: timelineFieldValueColumnStyle
			}
		>
			{children}
		</div>
	);

	const controls =
		keyframeControlsPlacement === 'after-label' ? (
			<TimelineRowKeyframeControlsColumn depth={rowDepth}>
				{keyframeControls}
			</TimelineRowKeyframeControlsColumn>
		) : null;

	if (stacked) {
		return (
			<div style={timelineStackedFieldContentStyle}>
				{controls ? (
					<div style={stackedHeaderStyle}>
						<div style={stackedLabelStyle}>{label}</div>
						{controls}
					</div>
				) : (
					label
				)}
				{value}
			</div>
		);
	}

	return (
		<>
			{label}
			{controls}
			{value}
		</>
	);
};
