import React from 'react';
import type {
	CanUpdateSequencePropStatusFalse,
	CanUpdateSequencePropStatusWithCodeValue,
	SequencePropsSubscriptionKey,
} from 'remotion';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {getComputedStatusLabel} from './get-timeline-keyframes';
import {TimelineArrayField} from './TimelineArrayField';
import {
	isTimelinePrimitiveFieldInfo,
	TimelinePrimitiveFieldValue,
} from './TimelinePrimitiveFieldValue';

const unsupportedLabel: React.CSSProperties = {
	color: 'rgba(255, 255, 255, 0.4)',
	fontSize: 12,
	fontStyle: 'italic',
	userSelect: 'none',
	WebkitUserSelect: 'none',
};

export const UnsupportedStatus: React.FC<{
	readonly label: string;
}> = ({label}) => {
	return <span style={unsupportedLabel}>{label}</span>;
};

export const TimelineNonEditableStatus: React.FC<{
	readonly propStatus: CanUpdateSequencePropStatusFalse;
}> = ({propStatus}) => {
	if (propStatus.status === 'computed') {
		return (
			<span style={unsupportedLabel}>{getComputedStatusLabel(propStatus)}</span>
		);
	}
};

export const TimelineFieldValue: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly onSave: TimelineFieldOnSave;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: () => void;
	readonly propStatus: CanUpdateSequencePropStatusWithCodeValue;
	readonly effectiveValue: unknown;
	readonly scaleLockNodePath: SequencePropsSubscriptionKey | null;
}> = ({
	field,
	onSave,
	onDragValueChange,
	onDragEnd,
	propStatus,
	effectiveValue,
	scaleLockNodePath,
}) => {
	if (isTimelinePrimitiveFieldInfo(field)) {
		return (
			<TimelinePrimitiveFieldValue
				effectiveValue={effectiveValue}
				field={field}
				onDragEnd={onDragEnd}
				onDragValueChange={onDragValueChange}
				onSave={onSave}
				propStatus={propStatus}
				scaleLockNodePath={scaleLockNodePath}
			/>
		);
	}

	if (field.typeName === 'array') {
		return (
			<span>
				<TimelineArrayField
					effectiveValue={effectiveValue}
					field={field}
					onDragEnd={onDragEnd}
					onDragValueChange={onDragValueChange}
					onSave={onSave}
				/>
			</span>
		);
	}

	throw new Error(`Unsupported field type: ${field.typeName}`);
};
