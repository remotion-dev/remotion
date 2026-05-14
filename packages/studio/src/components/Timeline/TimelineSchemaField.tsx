import React from 'react';
import type {CanUpdateSequencePropStatus} from 'remotion';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {TimelineBooleanField} from './TimelineBooleanField';
import {TimelineEnumField} from './TimelineEnumField';
import {TimelineNumberField} from './TimelineNumberField';
import {TimelineRotationField} from './TimelineRotationField';
import {TimelineTranslateField} from './TimelineTranslateField';

const unsupportedLabel: React.CSSProperties = {
	color: 'rgba(255, 255, 255, 0.4)',
	fontSize: 12,
	fontStyle: 'italic',
};

const notEditableBackground: React.CSSProperties = {
	backgroundColor: 'rgba(255, 0, 0, 0.2)',
	borderRadius: 3,
	padding: '0 4px',
};

const inlineWrapper: React.CSSProperties = {
	fontSize: 12,
};

export const TimelineFieldValue: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly onSave: TimelineFieldOnSave;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: () => void;
	readonly propStatus: CanUpdateSequencePropStatus;
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

	if (!field.supported) {
		return <span style={unsupportedLabel}>unsupported</span>;
	}

	if (!propStatus.canUpdate) {
		if (propStatus.reason === 'computed') {
			return <span style={unsupportedLabel}>computed</span>;
		}

		throw new Error(
			`Unsupported prop status: ${propStatus.reason satisfies never}`,
		);
	}

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

	if (field.typeName === 'rotation') {
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

	return (
		<span style={{...unsupportedLabel, fontStyle: 'normal'}}>
			{String(effectiveValue)}
		</span>
	);
};
