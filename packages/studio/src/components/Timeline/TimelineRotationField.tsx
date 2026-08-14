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
	leftAlignedDraggerStyle,
	normalizeTimelineNumber,
} from './timeline-field-utils';
import {formatTimelineRotationFieldValue} from './timeline-rotation-field-utils';
import {
	type CssRotationEuler,
	parseCssRotationToEuler,
	serializeCssRotation,
	serializeCssRotationFromEuler,
} from './timeline-rotation-utils';
import {Transform3DModeContext} from './Transform3DModeContext';

const containerStyle: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 4,
};

const compactDraggerStyle: React.CSSProperties = {
	paddingBottom: 2,
	paddingLeft: 2,
	paddingRight: 2,
	paddingTop: 2,
};

const ROTATION_LABELS = ['X', 'Y', 'Z'] as const;

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
	const [dragRotation, setDragRotation] = useState<CssRotationEuler | null>(
		null,
	);
	const transform3DMode = useContext(Transform3DModeContext);
	const isCssRotation = field.fieldSchema.type === 'rotation-css';
	const cssRotation = useMemo(
		() =>
			isCssRotation
				? parseCssRotationToEuler(String(effectiveValue ?? '0deg'))
				: ([0, 0, 0] as const),
		[effectiveValue, isCssRotation],
	);
	const show3D =
		isCssRotation &&
		(transform3DMode || cssRotation[0] !== 0 || cssRotation[1] !== 0);

	const degrees = isCssRotation
		? cssRotation[2]
		: typeof effectiveValue === 'number'
			? effectiveValue
			: 0;

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
		(value: number) =>
			isCssRotation
				? serializeCssRotation(value, Math.max(6, decimalPlaces))
				: normalizeTimelineNumber(value),
		[decimalPlaces, isCssRotation],
	);
	const serializeRotation = useCallback(
		(rotation: CssRotationEuler) =>
			serializeCssRotationFromEuler({
				rotation,
				decimalPlaces: Math.max(6, decimalPlaces),
			}),
		[decimalPlaces],
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

	const onRotationValueChange = useCallback(
		(rotationIndex: number, newValue: number) => {
			const nextRotation = [...(dragRotation ?? cssRotation)] as [
				number,
				number,
				number,
			];
			nextRotation[rotationIndex] = newValue;
			setDragRotation(nextRotation);
			onDragValueChange(serializeRotation(nextRotation));
		},
		[cssRotation, dragRotation, onDragValueChange, serializeRotation],
	);

	const onRotationValueChangeEnd = useCallback(
		(rotationIndex: number, newValue: number) => {
			const nextRotation = [...(dragRotation ?? cssRotation)] as [
				number,
				number,
				number,
			];
			nextRotation[rotationIndex] = newValue;
			const newRotation = serializeRotation(nextRotation);
			const clearDragState = () => {
				setDragRotation(null);
				onDragEnd();
			};

			if (newRotation !== propStatus.codeValue) {
				onSave(newRotation).finally(clearDragState);
			} else {
				clearDragState();
			}
		},
		[
			cssRotation,
			dragRotation,
			onDragEnd,
			onSave,
			propStatus.codeValue,
			serializeRotation,
		],
	);

	const onRotationTextChange = useCallback(
		(rotationIndex: number, newValue: string) => {
			const parsed = Number(newValue);
			if (Number.isNaN(parsed)) {
				return;
			}

			const nextRotation = [...(dragRotation ?? cssRotation)] as [
				number,
				number,
				number,
			];
			nextRotation[rotationIndex] = parsed;
			const newRotation = serializeRotation(nextRotation);
			if (newRotation !== propStatus.codeValue) {
				setDragRotation(nextRotation);
				onSave(newRotation).finally(() => setDragRotation(null));
			}
		},
		[
			cssRotation,
			dragRotation,
			onSave,
			propStatus.codeValue,
			serializeRotation,
		],
	);

	const angleDragger = (
		<InputDragger
			type="number"
			value={dragValue ?? degrees}
			buttonStyle={leftAlignedDraggerStyle}
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
			allowStepMismatch
			aria-label={isCssRotation ? 'Rotation Z' : 'Rotation angle'}
		/>
	);

	if (show3D) {
		return (
			<span style={containerStyle}>
				{ROTATION_LABELS.map((rotationLabel, rotationIndex) => (
					<InputDragger
						key={rotationLabel}
						type="number"
						value={(dragRotation ?? cssRotation)[rotationIndex]}
						buttonStyle={compactDraggerStyle}
						status="ok"
						small
						onValueChange={(newValue) =>
							onRotationValueChange(rotationIndex, newValue)
						}
						onValueChangeEnd={(newValue) =>
							onRotationValueChangeEnd(rotationIndex, newValue)
						}
						onTextChange={(newValue) =>
							onRotationTextChange(rotationIndex, newValue)
						}
						min={-Infinity}
						max={Infinity}
						step={step}
						formatter={formatter}
						rightAlign={false}
						allowStepMismatch
						aria-label={`Rotation ${rotationLabel}`}
					/>
				))}
			</span>
		);
	}

	return angleDragger;
};
