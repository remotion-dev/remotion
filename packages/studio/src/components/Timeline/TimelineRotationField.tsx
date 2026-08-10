import React, {useCallback, useContext, useMemo, useState} from 'react';
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
	parseCssRotation,
	parseCssRotationToDegrees,
	serializeCssRotation,
	serializeCssRotation3d,
} from './timeline-rotation-utils';
import {Transform3DModeContext} from './Transform3DModeContext';

const containerStyle: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 4,
};

const compactDraggerStyle: React.CSSProperties = {
	paddingLeft: 2,
	paddingRight: 2,
};

const ROTATION_AXIS_LABELS = ['X', 'Y', 'Z'] as const;

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
	const [dragAxis, setDragAxis] = useState<
		readonly [number, number, number] | null
	>(null);
	const transform3DMode = useContext(Transform3DModeContext);
	const isCssRotation = field.fieldSchema.type === 'rotation-css';
	const parsedCssRotation = useMemo(
		() =>
			isCssRotation ? parseCssRotation(String(effectiveValue ?? '0deg')) : null,
		[effectiveValue, isCssRotation],
	);
	const axis = useMemo(
		() => parsedCssRotation?.axis ?? ([0, 0, 1] as const),
		[parsedCssRotation],
	);
	const show3D =
		isCssRotation && (transform3DMode || axis[0] !== 0 || axis[1] !== 0);

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
		(value: number, rotationAxis = dragAxis ?? axis) => {
			return isCssRotation && show3D
				? serializeCssRotation3d({
						axis: rotationAxis,
						degrees: value,
						decimalPlaces,
					})
				: isCssRotation
					? serializeCssRotation(value, decimalPlaces)
					: normalizeTimelineNumber(value);
		},
		[axis, decimalPlaces, dragAxis, isCssRotation, show3D],
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

	const onAxisValueChange = useCallback(
		(axisIndex: number, newValue: number) => {
			const nextAxis = [...(dragAxis ?? axis)] as [number, number, number];
			nextAxis[axisIndex] = newValue;
			setDragAxis(nextAxis);
			onDragValueChange(serializeValue(dragValue ?? degrees, nextAxis));
		},
		[axis, degrees, dragAxis, dragValue, onDragValueChange, serializeValue],
	);

	const onAxisValueChangeEnd = useCallback(
		(axisIndex: number, newValue: number) => {
			const nextAxis = [...(dragAxis ?? axis)] as [number, number, number];
			nextAxis[axisIndex] = newValue;
			const newRotation = serializeValue(dragValue ?? degrees, nextAxis);
			const clearDragState = () => {
				setDragAxis(null);
				setDragValue(null);
				onDragEnd();
			};

			if (newRotation !== propStatus.codeValue) {
				onSave(newRotation).finally(clearDragState);
			} else {
				clearDragState();
			}
		},
		[
			axis,
			degrees,
			dragAxis,
			dragValue,
			onDragEnd,
			onSave,
			propStatus.codeValue,
			serializeValue,
		],
	);

	const onAxisTextChange = useCallback(
		(axisIndex: number, newValue: string) => {
			const parsed = Number(newValue);
			if (Number.isNaN(parsed)) {
				return;
			}

			const nextAxis = [...(dragAxis ?? axis)] as [number, number, number];
			nextAxis[axisIndex] = parsed;
			const newRotation = serializeValue(dragValue ?? degrees, nextAxis);
			if (newRotation !== propStatus.codeValue) {
				setDragAxis(nextAxis);
				onSave(newRotation).finally(() => setDragAxis(null));
			}
		},
		[
			axis,
			degrees,
			dragAxis,
			dragValue,
			onSave,
			propStatus.codeValue,
			serializeValue,
		],
	);

	const angleDragger = (
		<InputDragger
			type="number"
			value={dragValue ?? degrees}
			style={draggerStyle}
			buttonStyle={show3D ? compactDraggerStyle : undefined}
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
			aria-label="Rotation angle"
		/>
	);

	if (show3D) {
		return (
			<span style={containerStyle}>
				{ROTATION_AXIS_LABELS.map((axisLabel, axisIndex) => (
					<InputDragger
						key={axisLabel}
						type="number"
						value={(dragAxis ?? axis)[axisIndex]}
						buttonStyle={compactDraggerStyle}
						status="ok"
						small
						onValueChange={(newValue) => onAxisValueChange(axisIndex, newValue)}
						onValueChangeEnd={(newValue) =>
							onAxisValueChangeEnd(axisIndex, newValue)
						}
						onTextChange={(newValue) => onAxisTextChange(axisIndex, newValue)}
						min={-Infinity}
						max={Infinity}
						step={0.01}
						formatter={(value) => `${axisLabel} ${value}`}
						rightAlign={false}
						allowStepMismatch
						aria-label={`Rotation axis ${axisLabel}`}
					/>
				))}
				{angleDragger}
			</span>
		);
	}

	return angleDragger;
};
