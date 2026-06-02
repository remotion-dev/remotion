import React from 'react';
import type {
	CanUpdateSequencePropStatusFalse,
	CanUpdateSequencePropStatusTrue,
} from 'remotion';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {getComputedStatusLabel} from './get-timeline-keyframes';
import {TimelineBooleanField} from './TimelineBooleanField';
import {TimelineColorField} from './TimelineColorField';
import {TimelineEnumField} from './TimelineEnumField';
import {TimelineNumberField} from './TimelineNumberField';
import {TimelineRotationField} from './TimelineRotationField';
import {TimelineScaleField} from './TimelineScaleField';
import {TimelineTranslateField} from './TimelineTranslateField';
import {TimelineUvCoordinateField} from './TimelineUvCoordinateField';

const unsupportedLabel: React.CSSProperties = {
	color: 'rgba(255, 255, 255, 0.4)',
	fontSize: 12,
	fontStyle: 'italic',
	userSelect: 'none',
	WebkitUserSelect: 'none',
};

const notEditableBackground: React.CSSProperties = {
	backgroundColor: 'rgba(255, 0, 0, 0.2)',
	borderRadius: 3,
	padding: '0 4px',
};

const inlineWrapper: React.CSSProperties = {
	fontSize: 12,
};

export const UnsupportedStatus: React.FC<{
	readonly label: string;
}> = ({label}) => {
	return <span style={unsupportedLabel}>{label}</span>;
};

export const TimelineNonEditableStatus: React.FC<{
	readonly propStatus: CanUpdateSequencePropStatusFalse;
}> = ({propStatus}) => {
	if (propStatus.canUpdate) {
		return null;
	}

	if (propStatus.reason === 'computed' || propStatus.reason === 'keyframed') {
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
	readonly propStatus: CanUpdateSequencePropStatusTrue;
	readonly effectiveValue: unknown;
}> = ({
	field,
	onSave,
	onDragValueChange,
	onDragEnd,
	propStatus,
	effectiveValue,
}) => {
	const wrapperStyle: React.CSSProperties | undefined = !propStatus.canUpdate
		? notEditableBackground
		: undefined;

	if (field.typeName === 'number') {
		return (
			<span style={wrapperStyle}>
				<TimelineNumberField
					field={field}
					effectiveValue={effectiveValue}
					onSave={onSave}
					propStatus={propStatus}
					onDragValueChange={onDragValueChange}
					onDragEnd={onDragEnd}
				/>
			</span>
		);
	}

	if (
		field.typeName === 'rotation-css' ||
		field.typeName === 'rotation-degrees'
	) {
		return (
			<span style={wrapperStyle}>
				<TimelineRotationField
					field={field}
					effectiveValue={effectiveValue}
					propStatus={propStatus}
					onSave={onSave}
					onDragValueChange={onDragValueChange}
					onDragEnd={onDragEnd}
				/>
			</span>
		);
	}

	if (field.typeName === 'translate') {
		return (
			<span style={wrapperStyle}>
				<TimelineTranslateField
					field={field}
					effectiveValue={effectiveValue}
					propStatus={propStatus}
					onSave={onSave}
					onDragValueChange={onDragValueChange}
					onDragEnd={onDragEnd}
				/>
			</span>
		);
	}

	if (field.typeName === 'scale') {
		return (
			<span style={wrapperStyle}>
				<TimelineScaleField
					field={field}
					effectiveValue={effectiveValue}
					propStatus={propStatus}
					onSave={onSave}
					onDragValueChange={onDragValueChange}
					onDragEnd={onDragEnd}
				/>
			</span>
		);
	}

	if (field.typeName === 'uv-coordinate') {
		return (
			<span style={wrapperStyle}>
				<TimelineUvCoordinateField
					field={field}
					effectiveValue={effectiveValue}
					propStatus={propStatus}
					onSave={onSave}
					onDragValueChange={onDragValueChange}
					onDragEnd={onDragEnd}
				/>
			</span>
		);
	}

	if (field.typeName === 'boolean') {
		return (
			<span style={wrapperStyle}>
				<TimelineBooleanField
					field={field}
					propStatus={propStatus}
					onSave={onSave}
					effectiveValue={effectiveValue}
				/>
			</span>
		);
	}

	if (field.typeName === 'color') {
		return (
			<span style={wrapperStyle}>
				<TimelineColorField
					field={field}
					propStatus={propStatus}
					onSave={onSave}
					onDragValueChange={onDragValueChange}
					onDragEnd={onDragEnd}
					effectiveValue={effectiveValue}
				/>
			</span>
		);
	}

	if (field.typeName === 'enum') {
		return (
			<span style={inlineWrapper}>
				<TimelineEnumField
					field={field}
					propStatus={propStatus}
					onSave={onSave}
					effectiveValue={effectiveValue}
					onDragValueChange={onDragValueChange}
					onDragEnd={onDragEnd}
				/>
			</span>
		);
	}

	throw new Error(`Unsupported field type: ${field.typeName}`);
};
