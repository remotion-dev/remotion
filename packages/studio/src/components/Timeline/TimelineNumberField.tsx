import React, {useCallback, useState} from 'react';
import type {CanUpdateSequencePropStatusStatic} from 'remotion';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {InputDragger} from '../NewComposition/InputDragger';
import {formatTimelineFieldValueForDisplay} from './timeline-field-display-utils';
import {draggerStyle, leftAlignedDraggerStyle} from './timeline-field-utils';

export const TimelineNumberField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly effectiveValue: unknown;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly onSave: TimelineFieldOnSave;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: () => void;
}> = ({
	field,
	effectiveValue,
	onSave,
	onDragValueChange,
	onDragEnd,
	propStatus,
}) => {
	const [dragValue, setDragValue] = useState<number | null>(null);

	const onValueChange = useCallback(
		(newVal: number) => {
			setDragValue(newVal);
			onDragValueChange(newVal);
		},
		[onDragValueChange],
	);

	const onValueChangeEnd = useCallback(
		(newVal: number) => {
			if (newVal !== propStatus.codeValue) {
				onSave(newVal).finally(() => {
					setDragValue(null);
					onDragEnd();
				});
			} else {
				setDragValue(null);
				onDragEnd();
			}
		},
		[onSave, propStatus, onDragEnd],
	);

	const onTextChange = useCallback(
		(newVal: string) => {
			const parsed = Number(newVal);
			if (!Number.isNaN(parsed) && parsed !== propStatus.codeValue) {
				setDragValue(parsed);
				onSave(parsed).finally(() => {
					setDragValue(null);
				});
			}
		},
		[onSave, propStatus],
	);

	const configuredStep =
		field.fieldSchema.type === 'number' ? field.fieldSchema.step : undefined;
	const currentValue = dragValue ?? (effectiveValue as number);
	const step =
		field.fieldSchema.type === 'font-weight' && currentValue % 100 === 0
			? 100
			: (configuredStep ?? 1);
	const allowStepMismatch =
		field.fieldSchema.type === 'font-weight' ||
		field.group === 'crop' ||
		('kind' in field && field.kind === 'effect-field');

	const formatter = useCallback(
		(v: number | string) => {
			return formatTimelineFieldValueForDisplay({
				fieldSchema: field.fieldSchema,
				value: v,
			});
		},
		[field.fieldSchema],
	);

	return (
		<InputDragger
			type="number"
			value={currentValue}
			buttonStyle={leftAlignedDraggerStyle}
			style={draggerStyle}
			status="ok"
			small
			onValueChange={onValueChange}
			onValueChangeEnd={onValueChangeEnd}
			onTextChange={onTextChange}
			min={
				field.fieldSchema.type === 'number'
					? (field.fieldSchema.min ?? -Infinity)
					: field.fieldSchema.type === 'font-weight'
						? 1
						: -Infinity
			}
			max={
				field.fieldSchema.type === 'number'
					? (field.fieldSchema.max ?? Infinity)
					: field.fieldSchema.type === 'font-weight'
						? 1000
						: Infinity
			}
			step={step}
			formatter={formatter}
			rightAlign={false}
			allowStepMismatch={allowStepMismatch}
		/>
	);
};
