import React from 'react';
import type {
	ArrayFieldSchema,
	CanUpdateSequencePropStatusStatic,
	SequencePropsSubscriptionKey,
	VisibleFieldSchema,
} from 'remotion';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {TimelineBooleanField} from './TimelineBooleanField';
import {TimelineColorField} from './TimelineColorField';
import {TimelineEnumField} from './TimelineEnumField';
import {TimelineFontFamilyField} from './TimelineFontFamilyField';
import {TimelineNumberField} from './TimelineNumberField';
import {TimelineRotationField} from './TimelineRotationField';
import {TimelineScaleField} from './TimelineScaleField';
import {TimelineTextContentField} from './TimelineTextContentField';
import {TimelineTransformOriginField} from './TimelineTransformOriginField';
import {TimelineTranslateField} from './TimelineTranslateField';
import {TimelineUvCoordinateField} from './TimelineUvCoordinateField';

const inlineWrapper: React.CSSProperties = {
	fontSize: 12,
};

export type TimelinePrimitiveFieldInfo = Omit<
	SchemaFieldInfo,
	'fieldSchema' | 'typeName'
> & {
	readonly fieldSchema: Exclude<VisibleFieldSchema, ArrayFieldSchema>;
	readonly typeName: Exclude<VisibleFieldSchema['type'], 'array'>;
};

export const isTimelinePrimitiveFieldInfo = (
	field: SchemaFieldInfo,
): field is TimelinePrimitiveFieldInfo => {
	return (
		field.typeName !== 'array' &&
		field.typeName !== 'hidden' &&
		field.fieldSchema.type !== 'array'
	);
};

export const TimelinePrimitiveFieldValue: React.FC<{
	readonly field: TimelinePrimitiveFieldInfo;
	readonly onSave: TimelineFieldOnSave;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: () => void;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
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
	if (field.typeName === 'number') {
		return (
			<span>
				<TimelineNumberField
					effectiveValue={effectiveValue}
					field={field}
					onDragEnd={onDragEnd}
					onDragValueChange={onDragValueChange}
					onSave={onSave}
					propStatus={propStatus}
				/>
			</span>
		);
	}

	if (
		field.typeName === 'rotation-css' ||
		field.typeName === 'rotation-degrees'
	) {
		return (
			<span>
				<TimelineRotationField
					effectiveValue={effectiveValue}
					field={field}
					onDragEnd={onDragEnd}
					onDragValueChange={onDragValueChange}
					onSave={onSave}
					propStatus={propStatus}
				/>
			</span>
		);
	}

	if (field.typeName === 'translate') {
		return (
			<span>
				<TimelineTranslateField
					effectiveValue={effectiveValue}
					field={field}
					onDragEnd={onDragEnd}
					onDragValueChange={onDragValueChange}
					onSave={onSave}
					propStatus={propStatus}
				/>
			</span>
		);
	}

	if (field.typeName === 'transform-origin') {
		return (
			<span>
				<TimelineTransformOriginField
					effectiveValue={effectiveValue}
					field={field}
					onDragEnd={onDragEnd}
					onDragValueChange={onDragValueChange}
					onSave={onSave}
					propStatus={propStatus}
				/>
			</span>
		);
	}

	if (field.typeName === 'scale') {
		if (scaleLockNodePath === null) {
			throw new Error('Expected scale lock node path for scale field');
		}

		return (
			<span>
				<TimelineScaleField
					effectiveValue={effectiveValue}
					field={field}
					onDragEnd={onDragEnd}
					onDragValueChange={onDragValueChange}
					onSave={onSave}
					propStatus={propStatus}
					scaleLockNodePath={scaleLockNodePath}
				/>
			</span>
		);
	}

	if (field.typeName === 'uv-coordinate') {
		return (
			<span>
				<TimelineUvCoordinateField
					effectiveValue={effectiveValue}
					field={field}
					onDragEnd={onDragEnd}
					onDragValueChange={onDragValueChange}
					onSave={onSave}
					propStatus={propStatus}
				/>
			</span>
		);
	}

	if (field.typeName === 'boolean') {
		return (
			<span>
				<TimelineBooleanField
					effectiveValue={effectiveValue}
					field={field}
					onSave={onSave}
					propStatus={propStatus}
				/>
			</span>
		);
	}

	if (field.typeName === 'color') {
		return (
			<span>
				<TimelineColorField
					effectiveValue={effectiveValue}
					field={field}
					onDragEnd={onDragEnd}
					onDragValueChange={onDragValueChange}
					onSave={onSave}
					propStatus={propStatus}
				/>
			</span>
		);
	}

	if (field.typeName === 'enum') {
		return (
			<span style={inlineWrapper}>
				<TimelineEnumField
					effectiveValue={effectiveValue}
					field={field}
					onDragEnd={onDragEnd}
					onDragValueChange={onDragValueChange}
					onSave={onSave}
					propStatus={propStatus}
				/>
			</span>
		);
	}

	if (field.typeName === 'text-content') {
		return (
			<span style={inlineWrapper}>
				<TimelineTextContentField
					effectiveValue={effectiveValue}
					field={field}
					nodePath={scaleLockNodePath}
					onDragEnd={onDragEnd}
					onDragValueChange={onDragValueChange}
					onSave={onSave}
					propStatus={propStatus}
				/>
			</span>
		);
	}

	if (field.typeName === 'font-family') {
		return (
			<span style={inlineWrapper}>
				<TimelineFontFamilyField
					effectiveValue={effectiveValue}
					field={field}
					onDragEnd={onDragEnd}
					onDragValueChange={onDragValueChange}
					onSave={onSave}
					propStatus={propStatus}
				/>
			</span>
		);
	}

	throw new Error(`Unsupported field type: ${field.typeName satisfies never}`);
};
