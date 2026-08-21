import React, {useContext} from 'react';
import type {SchemaFieldInfo} from '../../helpers/timeline-layout';
import {
	isTimelineFieldStacked,
	timelineFieldValueColumnStyle,
	TIMELINE_STACKED_FIELD_HEADER_HEIGHT,
	timelineStackedFieldContentStyle,
} from './timeline-field-row-layout';
import {TimelineFieldLabel} from './TimelineFieldLabel';
import {TimelineRowKeyframeControlsColumn} from './TimelineRowChrome';
import {TimelineRowLayoutContext} from './TimelineRowLayoutContext';
import {TIMELINE_SELECTED_LABEL_HORIZONTAL_PADDING} from './TimelineSelection';
import {Transform3DModeContext} from './Transform3DModeContext';

const stackedHeaderStyle: React.CSSProperties = {
	display: 'flex',
	flex: `0 0 ${TIMELINE_STACKED_FIELD_HEADER_HEIGHT}px`,
	minWidth: 0,
};

const stackedLabelStyle: React.CSSProperties = {
	flex: 1,
	minWidth: 0,
};

const stackedValueStyle: React.CSSProperties = {
	...timelineFieldValueColumnStyle,
	paddingLeft: TIMELINE_SELECTED_LABEL_HORIZONTAL_PADDING,
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
	const label = (
		<TimelineFieldLabel
			rowDepth={rowDepth}
			selected={selected}
			label={field.description ?? field.key}
			stacked={stacked}
		/>
	);
	const value = (
		<div style={stacked ? stackedValueStyle : timelineFieldValueColumnStyle}>
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
