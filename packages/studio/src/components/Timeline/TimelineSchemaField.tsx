import React from 'react';
import type {CanUpdateSequencePropStatus} from 'remotion';
import type {SchemaFieldInfo} from '../../helpers/timeline-layout';
import {TimelineBooleanField} from './TimelineBooleanField';
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

export const TimelineFieldValue: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly onSave: (key: string, value: unknown) => Promise<void>;
	readonly onDragValueChange: (key: string, value: unknown) => void;
	readonly onDragEnd: () => void;
	readonly canUpdate: boolean;
	readonly propStatus: CanUpdateSequencePropStatus | null;
	readonly codeValue: unknown;
	readonly effectiveValue: unknown;
}> = ({
	field,
	onSave,
	onDragValueChange,
	onDragEnd,
	propStatus,
	canUpdate,
	effectiveValue,
	codeValue,
}) => {
	const wrapperStyle: React.CSSProperties | undefined =
		canUpdate === null || canUpdate === false
			? notEditableBackground
			: undefined;

	if (!field.supported) {
		return <span style={unsupportedLabel}>unsupported</span>;
	}

	if (propStatus !== null && !propStatus.canUpdate) {
		if (propStatus.reason === 'computed') {
			return <span style={unsupportedLabel}>computed</span>;
		}

		throw new Error(
			`Unsupported prop status: ${propStatus.reason satisfies never}`,
		);
	}

	if (propStatus === null) {
		return (
			<span style={notEditableBackground}>
				<span style={unsupportedLabel}>error</span>
			</span>
		);
	}

	if (field.typeName === 'number') {
		return (
			<span style={wrapperStyle}>
				<TimelineNumberField
					field={field}
					effectiveValue={effectiveValue}
					canUpdate={canUpdate}
					onSave={onSave}
					codeValue={codeValue}
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
					codeValue={codeValue}
					canUpdate={canUpdate}
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
					codeValue={codeValue}
					canUpdate={canUpdate}
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
					codeValue={codeValue}
					canUpdate={canUpdate}
					onSave={onSave}
					effectiveValue={effectiveValue}
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
