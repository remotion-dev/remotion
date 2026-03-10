import React, {useCallback, useMemo, useState} from 'react';
import type {SchemaFieldInfo} from '../../helpers/timeline-layout';
import {InputDragger} from '../NewComposition/InputDragger';
import {draggerStyle, getDecimalPlaces} from './timeline-field-utils';

export const TimelineNumberField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly effectiveValue: unknown;
	readonly codeValue: unknown;
	readonly canUpdate: boolean;
	readonly onSave: (key: string, value: unknown) => Promise<void>;
	readonly onDragValueChange: (key: string, value: unknown) => void;
	readonly onDragEnd: () => void;
}> = ({
	field,
	effectiveValue,
	canUpdate,
	onSave,
	onDragValueChange,
	onDragEnd,
	codeValue,
}) => {
	const [dragValue, setDragValue] = useState<number | null>(null);

	const onValueChange = useCallback(
		(newVal: number) => {
			setDragValue(newVal);
			onDragValueChange(field.key, newVal);
		},
		[onDragValueChange, field.key],
	);

	const onValueChangeEnd = useCallback(
		(newVal: number) => {
			if (canUpdate && newVal !== codeValue) {
				onSave(field.key, newVal).finally(() => {
					setDragValue(null);
					onDragEnd();
				});
			} else {
				setDragValue(null);
				onDragEnd();
			}
		},
		[canUpdate, onSave, field.key, codeValue, onDragEnd],
	);

	const onTextChange = useCallback(
		(newVal: string) => {
			if (canUpdate) {
				const parsed = Number(newVal);
				if (!Number.isNaN(parsed) && parsed !== codeValue) {
					setDragValue(parsed);
					onSave(field.key, parsed).catch(() => {
						setDragValue(null);
					});
				}
			}
		},
		[canUpdate, onSave, field.key, codeValue],
	);

	const step =
		field.fieldSchema.type === 'number' ? (field.fieldSchema.step ?? 1) : 1;

	const stepDecimals = useMemo(() => getDecimalPlaces(step), [step]);

	const formatter = useCallback(
		(v: number | string) => {
			const num = Number(v);
			const digits = Math.max(stepDecimals, getDecimalPlaces(num));
			return digits === 0 ? String(num) : num.toFixed(digits);
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
