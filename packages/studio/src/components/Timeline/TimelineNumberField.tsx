import React, {useCallback, useState} from 'react';
import type {CanUpdateSequencePropStatusStatic} from 'remotion';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragEnd,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {InputDragger} from '../NewComposition/InputDragger';
import {formatTimelineFieldValueForDisplay} from './timeline-field-display-utils';
import {draggerStyle, leftAlignedDraggerStyle} from './timeline-field-utils';
import {useTimelineFieldEdit} from './use-timeline-field-edit';

export const TimelineNumberField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly effectiveValue: unknown;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly onSave: TimelineFieldOnSave;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: TimelineFieldOnDragEnd;
}> = ({
	field,
	effectiveValue,
	onSave,
	onDragValueChange,
	onDragEnd,
	propStatus,
}) => {
	const {markEdit, finishEdit} = useTimelineFieldEdit();
	const [dragValue, setDragValue] = useState<number | null>(null);

	const onValueChangeCancel = useCallback(() => {
		markEdit();
		setDragValue(null);
		onDragEnd('cancel');
	}, [markEdit, onDragEnd]);

	const onValueChange = useCallback(
		(newVal: number) => {
			markEdit();
			setDragValue(newVal);
			onDragValueChange(newVal);
		},
		[onDragValueChange, markEdit],
	);

	const onValueChangeEnd = useCallback(
		(newVal: number) => {
			markEdit();
			if (newVal !== propStatus.codeValue) {
				finishEdit(onSave(newVal), () => {
					setDragValue(null);
					onDragEnd('commit');
				});
			} else {
				setDragValue(null);
				onDragEnd('cancel');
			}
		},
		[onSave, propStatus, onDragEnd, markEdit, finishEdit],
	);

	const onTextChange = useCallback(
		(newVal: string) => {
			const parsed = Number(newVal);
			if (!Number.isNaN(parsed) && parsed !== propStatus.codeValue) {
				markEdit();
				setDragValue(parsed);
				finishEdit(onSave(parsed), () => {
					setDragValue(null);
				});
			}
		},
		[onSave, propStatus, markEdit, finishEdit],
	);

	const configuredStep =
		field.fieldSchema.type === 'number' ? field.fieldSchema.step : undefined;
	const currentValue = dragValue ?? (effectiveValue as number);
	const step =
		field.fieldSchema.type === 'font-weight' && currentValue % 100 === 0
			? 100
			: (configuredStep ?? 1);
	const integerOnly =
		field.fieldSchema.type === 'number' && field.fieldSchema.integer === true;
	const inherited =
		field.key === 'premountFor' &&
		field.fieldSchema.default === undefined &&
		propStatus.codeValue === undefined &&
		dragValue === null;

	const formatter = useCallback(
		(v: number | string) => {
			const formatted = formatTimelineFieldValueForDisplay({
				fieldSchema: field.fieldSchema,
				value: v,
			});
			return inherited ? `Default (${formatted})` : formatted;
		},
		[field.fieldSchema, inherited],
	);

	return (
		<InputDragger
			onValueChangeCancel={onValueChangeCancel}
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
			dragSensitivity={
				field.fieldSchema.type === 'font-weight' && step === 100 ? 0.1 : 1
			}
			formatter={formatter}
			rightAlign={false}
			allowStepMismatch
			integerOnly={integerOnly}
		/>
	);
};
