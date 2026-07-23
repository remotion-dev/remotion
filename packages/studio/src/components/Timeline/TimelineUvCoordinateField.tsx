import React, {useCallback, useMemo, useState} from 'react';
import type {CanUpdateSequencePropStatusStatic} from 'remotion';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {InputDragger} from '../NewComposition/InputDragger';
import {formatTimelineFieldValueForDisplay} from './timeline-field-display-utils';
import {getTimelineDisplayDecimalPlaces} from './timeline-field-utils';

const leftDraggerStyle: React.CSSProperties = {
	paddingLeft: 0,
};

const rightDraggerStyle: React.CSSProperties = {
	paddingRight: 0,
};

const containerStyle: React.CSSProperties = {
	display: 'flex',
	gap: 4,
};

const parseUvCoordinate = (value: unknown): [number, number] => {
	if (
		Array.isArray(value) &&
		value.length === 2 &&
		value.every((item) => typeof item === 'number' && Number.isFinite(item))
	) {
		return [value[0], value[1]];
	}

	return [0, 0];
};

const tuplesEqual = (
	left: unknown,
	right: readonly [number, number],
): boolean => {
	if (!Array.isArray(left) || left.length !== 2) {
		return false;
	}

	return left[0] === right[0] && left[1] === right[1];
};

export const TimelineUvCoordinateField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly effectiveValue: unknown;
	readonly onSave: TimelineFieldOnSave;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: () => void;
}> = ({
	field,
	propStatus,
	effectiveValue,
	onSave,
	onDragValueChange,
	onDragEnd,
}) => {
	const [dragX, setDragX] = useState<number | null>(null);
	const [dragY, setDragY] = useState<number | null>(null);

	const [codeX, codeY] = useMemo(
		() => parseUvCoordinate(effectiveValue),
		[effectiveValue],
	);

	const configuredStep =
		field.fieldSchema.type === 'uv-coordinate'
			? field.fieldSchema.step
			: undefined;
	const step = configuredStep ?? 0.01;

	const min =
		field.fieldSchema.type === 'uv-coordinate'
			? (field.fieldSchema.min ?? -Infinity)
			: -Infinity;

	const max =
		field.fieldSchema.type === 'uv-coordinate'
			? (field.fieldSchema.max ?? Infinity)
			: Infinity;

	const decimalPlaces = useMemo(
		() =>
			getTimelineDisplayDecimalPlaces({
				defaultDecimalPlaces: 2,
				step: configuredStep,
			}),
		[configuredStep],
	);

	const formatter = useCallback(
		(v: number | string) => {
			return formatTimelineFieldValueForDisplay({
				fieldSchema: field.fieldSchema,
				value: v,
			});
		},
		[field.fieldSchema],
	);

	const onXChange = useCallback(
		(newVal: number) => {
			setDragX(newVal);
			const currentY = dragY ?? codeY;
			onDragValueChange([newVal, currentY]);
		},
		[onDragValueChange, dragY, codeY],
	);

	const onXChangeEnd = useCallback(
		(newVal: number) => {
			const currentY = dragY ?? codeY;
			const newTuple: [number, number] = [newVal, currentY];
			if (!tuplesEqual(propStatus.codeValue, newTuple)) {
				onSave(newTuple).finally(() => {
					setDragX(null);
					onDragEnd();
				});
			} else {
				setDragX(null);
				onDragEnd();
			}
		},
		[dragY, codeY, propStatus, onSave, onDragEnd],
	);

	const onXTextChange = useCallback(
		(newVal: string) => {
			const parsed = Number(newVal);
			if (!Number.isNaN(parsed)) {
				const currentY = dragY ?? codeY;
				const newTuple: [number, number] = [parsed, currentY];
				if (!tuplesEqual(propStatus.codeValue, newTuple)) {
					setDragX(parsed);
					onSave(newTuple).finally(() => {
						setDragX(null);
					});
				}
			}
		},
		[propStatus, dragY, codeY, onSave],
	);

	const onYChange = useCallback(
		(newVal: number) => {
			setDragY(newVal);
			const currentX = dragX ?? codeX;
			onDragValueChange([currentX, newVal]);
		},
		[onDragValueChange, dragX, codeX],
	);

	const onYChangeEnd = useCallback(
		(newVal: number) => {
			const currentX = dragX ?? codeX;
			const newTuple: [number, number] = [currentX, newVal];
			if (!tuplesEqual(propStatus.codeValue, newTuple)) {
				onSave(newTuple).finally(() => {
					setDragY(null);
					onDragEnd();
				});
			} else {
				setDragY(null);
				onDragEnd();
			}
		},
		[dragX, codeX, propStatus, onSave, onDragEnd],
	);

	const onYTextChange = useCallback(
		(newVal: string) => {
			const parsed = Number(newVal);
			if (!Number.isNaN(parsed)) {
				const currentX = dragX ?? codeX;
				const newTuple: [number, number] = [currentX, parsed];
				if (!tuplesEqual(propStatus.codeValue, newTuple)) {
					setDragY(parsed);
					onSave(newTuple).finally(() => {
						setDragY(null);
					});
				}
			}
		},
		[propStatus, onSave, dragX, codeX],
	);

	return (
		<span style={containerStyle}>
			<InputDragger
				type="number"
				value={dragX ?? codeX}
				style={leftDraggerStyle}
				status="ok"
				small
				onValueChange={onXChange}
				onValueChangeEnd={onXChangeEnd}
				onTextChange={onXTextChange}
				min={min}
				max={max}
				step={step}
				formatter={formatter}
				rightAlign={false}
				snapToStep={false}
				dragDecimalPlaces={decimalPlaces}
			/>
			<div style={{marginLeft: -6, marginRight: -6}} />
			<InputDragger
				type="number"
				value={dragY ?? codeY}
				style={rightDraggerStyle}
				status="ok"
				small
				onValueChange={onYChange}
				onValueChangeEnd={onYChangeEnd}
				onTextChange={onYTextChange}
				min={min}
				max={max}
				step={step}
				formatter={formatter}
				rightAlign={false}
				snapToStep={false}
				dragDecimalPlaces={decimalPlaces}
			/>
		</span>
	);
};
