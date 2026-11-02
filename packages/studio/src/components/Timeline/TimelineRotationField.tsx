import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {CanUpdateSequencePropStatusStatic} from 'remotion';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragEnd,
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
import {useTimelineFieldEdit} from './use-timeline-field-edit';

const containerStyle: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 4,
};

const compactDraggerStyle: React.CSSProperties = {
	paddingLeft: 2,
	paddingRight: 2,
};

const ROTATION_LABELS = ['X', 'Y', 'Z'] as const;

export const TimelineRotationField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly effectiveValue: unknown;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly onSave: TimelineFieldOnSave;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: TimelineFieldOnDragEnd;
}> = ({
	field,
	effectiveValue,
	propStatus,
	onSave,
	onDragValueChange,
	onDragEnd,
}) => {
	const {markEdit, finishEdit} = useTimelineFieldEdit();
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

	const onValueChangeCancel = useCallback(() => {
		markEdit();
		setDragValue(null);
		setDragRotation(null);
		onDragEnd('cancel');
	}, [markEdit, onDragEnd]);

	const onValueChange = useCallback(
		(newVal: number) => {
			markEdit();
			setDragValue(newVal);
			onDragValueChange(serializeValue(newVal));
		},
		[onDragValueChange, serializeValue, markEdit],
	);

	const onValueChangeEnd = useCallback(
		(newVal: number) => {
			markEdit();
			const newValue = serializeValue(newVal);
			if (newValue !== propStatus.codeValue) {
				finishEdit(onSave(newValue), () => {
					setDragValue(null);
					onDragEnd('commit');
				});
			} else {
				setDragValue(null);
				onDragEnd('cancel');
			}
		},
		[propStatus, onSave, onDragEnd, serializeValue, markEdit, finishEdit],
	);

	const onTextChange = useCallback(
		(newVal: string) => {
			const parsed = Number(newVal);
			if (!Number.isNaN(parsed)) {
				const newValue = serializeValue(parsed);
				if (newValue !== propStatus.codeValue) {
					markEdit();
					setDragValue(parsed);
					finishEdit(onSave(newValue), () => {
						setDragValue(null);
					});
				}
			}
		},
		[propStatus, onSave, serializeValue, markEdit, finishEdit],
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
			markEdit();
			const nextRotation = [...(dragRotation ?? cssRotation)] as [
				number,
				number,
				number,
			];
			nextRotation[rotationIndex] = newValue;
			setDragRotation(nextRotation);
			onDragValueChange(serializeRotation(nextRotation));
		},
		[cssRotation, dragRotation, onDragValueChange, serializeRotation, markEdit],
	);

	const onRotationValueChangeEnd = useCallback(
		(rotationIndex: number, newValue: number) => {
			markEdit();
			const nextRotation = [...(dragRotation ?? cssRotation)] as [
				number,
				number,
				number,
			];
			nextRotation[rotationIndex] = newValue;
			const newRotation = serializeRotation(nextRotation);
			const clearDragState: TimelineFieldOnDragEnd = (reason) => {
				setDragRotation(null);
				onDragEnd(reason);
			};

			if (newRotation !== propStatus.codeValue) {
				finishEdit(onSave(newRotation), () => clearDragState('commit'));
			} else {
				clearDragState('cancel');
			}
		},
		[
			cssRotation,
			dragRotation,
			onDragEnd,
			onSave,
			propStatus.codeValue,
			serializeRotation,
			markEdit,
			finishEdit,
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
				markEdit();
				setDragRotation(nextRotation);
				finishEdit(onSave(newRotation), () => setDragRotation(null));
			}
		},
		[
			cssRotation,
			dragRotation,
			onSave,
			propStatus.codeValue,
			serializeRotation,
			markEdit,
			finishEdit,
		],
	);

	const angleDragger = (
		<InputDragger
			onValueChangeCancel={onValueChangeCancel}
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
						onValueChangeCancel={onValueChangeCancel}
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
