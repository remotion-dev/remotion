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
	getTimelineDisplayDecimalPlaces,
	normalizeTimelineNumber,
} from './timeline-field-utils';
import {formatTimelineRotationFieldValue} from './timeline-rotation-field-utils';
import {
	parseCssRotationToDegrees,
	serializeCssRotation,
} from './timeline-rotation-utils';

export const TimelineRotationField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly effectiveValue: unknown;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly onSave: TimelineFieldOnSave;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: () => void;
}> = ({
	field,
	effectiveValue,
	propStatus,
	onSave,
	onDragValueChange,
	onDragEnd,
}) => {
	const [dragValue, setDragValue] = useState<number | null>(null);
	const isCssRotation = field.fieldSchema.type === 'rotation-css';

	const degrees = useMemo(() => {
		if (isCssRotation) {
			return parseCssRotationToDegrees(String(effectiveValue ?? '0deg'));
		}

		return typeof effectiveValue === 'number' ? effectiveValue : 0;
	}, [effectiveValue, isCssRotation]);

	const configuredStep =
		field.fieldSchema.type === 'rotation-css' ||
		field.fieldSchema.type === 'rotation-degrees'
			? field.fieldSchema.step
			: undefined;
	const step = configuredStep ?? 1;
	const min =
		field.fieldSchema.type === 'rotation-degrees'
			? (field.fieldSchema.min ?? -Infinity)
			: -Infinity;
	const max =
		field.fieldSchema.type === 'rotation-degrees'
			? (field.fieldSchema.max ?? Infinity)
			: Infinity;

	const decimalPlaces = useMemo(
		() =>
			getTimelineDisplayDecimalPlaces({
				defaultDecimalPlaces: 1,
				step: configuredStep,
			}),
		[configuredStep],
	);

	const serializeValue = useCallback(
		(value: number) => {
			return isCssRotation
				? serializeCssRotation(value, decimalPlaces)
				: normalizeTimelineNumber(value);
		},
		[decimalPlaces, isCssRotation],
	);

	const onValueChange = useCallback(
		(newVal: number) => {
			setDragValue(newVal);
			onDragValueChange(serializeValue(newVal));
		},
		[onDragValueChange, serializeValue],
	);

	const onValueChangeEnd = useCallback(
		(newVal: number) => {
			const newValue = serializeValue(newVal);
			if (newValue !== propStatus.codeValue) {
				onSave(newValue).finally(() => {
					setDragValue(null);
					onDragEnd();
				});
			} else {
				setDragValue(null);
				onDragEnd();
			}
		},
		[propStatus, onSave, onDragEnd, serializeValue],
	);

	const onTextChange = useCallback(
		(newVal: string) => {
			const parsed = Number(newVal);
			if (!Number.isNaN(parsed)) {
				const newValue = serializeValue(parsed);
				if (newValue !== propStatus.codeValue) {
					setDragValue(parsed);
					onSave(newValue).finally(() => {
						setDragValue(null);
					});
				}
			}
		},
		[propStatus, onSave, serializeValue],
	);

	const formatter = useCallback(
		(v: number | string) => {
			return formatTimelineRotationFieldValue({
				decimalPlaces,
				fieldSchema: field.fieldSchema,
				value: v,
			});
		},
		[decimalPlaces, field.fieldSchema],
	);

	return (
		<InputDragger
			type="number"
			value={dragValue ?? degrees}
			style={draggerStyle}
			status="ok"
			small
			onValueChange={onValueChange}
			onValueChangeEnd={onValueChangeEnd}
			onTextChange={onTextChange}
			min={min}
			max={max}
			step={step}
			formatter={formatter}
			rightAlign={false}
		/>
	);
};
