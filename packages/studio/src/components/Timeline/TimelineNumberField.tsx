import React, {useCallback, useMemo, useState} from 'react';
import type {CanUpdateSequencePropStatusStatic} from 'remotion';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {InputDragger} from '../NewComposition/InputDragger';
import {
	draggerStyle,
	formatTimelineNumber,
	getDecimalPlaces,
} from './timeline-field-utils';

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
	const step = configuredStep ?? 1;

	const stepDecimals = useMemo(
		() =>
			configuredStep === undefined ? null : getDecimalPlaces(configuredStep),
		[configuredStep],
	);

	const formatter = useCallback(
		(v: number | string) => {
			const num = Number(v);
			if (stepDecimals === null) {
				const digits = getDecimalPlaces(num);
				return digits === 0 ? String(num) : num.toFixed(digits);
			}

			return formatTimelineNumber({
				decimalPlaces: stepDecimals,
				fixed: true,
				value: num,
			});
		},
		[stepDecimals],
	);

	return (
		<InputDragger
			type="number"
			value={dragValue ?? (effectiveValue as number)}
			style={draggerStyle}
			status="ok"
			small
			onValueChange={onValueChange}
			onValueChangeEnd={onValueChangeEnd}
			onTextChange={onTextChange}
			min={
				field.fieldSchema.type === 'number'
					? (field.fieldSchema.min ?? -Infinity)
					: -Infinity
			}
			max={
				field.fieldSchema.type === 'number'
					? (field.fieldSchema.max ?? Infinity)
					: Infinity
			}
			step={step}
			formatter={formatter}
			rightAlign={false}
		/>
	);
};
