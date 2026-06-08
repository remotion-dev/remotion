import React, {useCallback, useMemo, useState} from 'react';
import type {CanUpdateSequencePropStatusStatic} from 'remotion';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {InputDragger} from '../NewComposition/InputDragger';
import {
	formatTimelineNumber,
	getTimelineDisplayDecimalPlaces,
} from './timeline-field-utils';
import {
	parseTransformOrigin,
	serializeTransformOrigin,
	type TransformOriginCoordinate,
} from './timeline-transform-origin-utils';

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

export const TimelineTransformOriginField: React.FC<{
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
	const [dragX, setDragX] = useState<TransformOriginCoordinate | null>(null);
	const [dragY, setDragY] = useState<TransformOriginCoordinate | null>(null);

	const defaultValue =
		field.fieldSchema.type === 'transform-origin'
			? (field.fieldSchema.default ?? '50% 50%')
			: '50% 50%';

	const parsed = useMemo(
		() => parseTransformOrigin(String(effectiveValue ?? defaultValue)),
		[defaultValue, effectiveValue],
	);

	const decimalPlaces = useMemo(
		() =>
			getTimelineDisplayDecimalPlaces({
				defaultDecimalPlaces: 1,
				step: undefined,
			}),
		[],
	);

	const formatter = useCallback(
		(unit: TransformOriginCoordinate['unit']) => (v: number | string) => {
			const formatted = formatTimelineNumber({
				decimalPlaces,
				fixed: false,
				value: v,
			});
			return `${formatted}${unit}`;
		},
		[decimalPlaces],
	);

	const serialize = useCallback(
		(nextX: TransformOriginCoordinate, nextY: TransformOriginCoordinate) => {
			return serializeTransformOrigin({
				x: nextX,
				y: nextY,
				z: parsed.z,
				decimalPlaces,
			});
		},
		[decimalPlaces, parsed.z],
	);

	const onXChange = useCallback(
		(newVal: number) => {
			const nextX = {...(dragX ?? parsed.x), value: newVal};
			setDragX(nextX);
			onDragValueChange(serialize(nextX, dragY ?? parsed.y));
		},
		[dragX, dragY, onDragValueChange, parsed.x, parsed.y, serialize],
	);

	const onXChangeEnd = useCallback(
		(newVal: number) => {
			const nextX = {...(dragX ?? parsed.x), value: newVal};
			const newStr = serialize(nextX, dragY ?? parsed.y);
			if (newStr !== propStatus.codeValue) {
				onSave(newStr).finally(() => {
					setDragX(null);
					onDragEnd();
				});
			} else {
				setDragX(null);
				onDragEnd();
			}
		},
		[
			dragX,
			dragY,
			onDragEnd,
			onSave,
			parsed.x,
			parsed.y,
			propStatus,
			serialize,
		],
	);

	const onXTextChange = useCallback(
		(newVal: string) => {
			const parsedValue = Number(newVal);
			if (Number.isNaN(parsedValue)) {
				return;
			}

			const nextX = {...(dragX ?? parsed.x), value: parsedValue};
			const newStr = serialize(nextX, dragY ?? parsed.y);
			if (newStr !== propStatus.codeValue) {
				setDragX(nextX);
				onSave(newStr).finally(() => {
					setDragX(null);
				});
			}
		},
		[dragX, dragY, onSave, parsed.x, parsed.y, propStatus, serialize],
	);

	const onYChange = useCallback(
		(newVal: number) => {
			const nextY = {...(dragY ?? parsed.y), value: newVal};
			setDragY(nextY);
			onDragValueChange(serialize(dragX ?? parsed.x, nextY));
		},
		[dragX, dragY, onDragValueChange, parsed.x, parsed.y, serialize],
	);

	const onYChangeEnd = useCallback(
		(newVal: number) => {
			const nextY = {...(dragY ?? parsed.y), value: newVal};
			const newStr = serialize(dragX ?? parsed.x, nextY);
			if (newStr !== propStatus.codeValue) {
				onSave(newStr).finally(() => {
					setDragY(null);
					onDragEnd();
				});
			} else {
				setDragY(null);
				onDragEnd();
			}
		},
		[
			dragX,
			dragY,
			onDragEnd,
			onSave,
			parsed.x,
			parsed.y,
			propStatus,
			serialize,
		],
	);

	const onYTextChange = useCallback(
		(newVal: string) => {
			const parsedValue = Number(newVal);
			if (Number.isNaN(parsedValue)) {
				return;
			}

			const nextY = {...(dragY ?? parsed.y), value: parsedValue};
			const newStr = serialize(dragX ?? parsed.x, nextY);
			if (newStr !== propStatus.codeValue) {
				setDragY(nextY);
				onSave(newStr).finally(() => {
					setDragY(null);
				});
			}
		},
		[dragX, dragY, onSave, parsed.x, parsed.y, propStatus, serialize],
	);

	return (
		<span style={containerStyle}>
			<InputDragger
				type="number"
				value={dragX?.value ?? parsed.x.value}
				style={leftDraggerStyle}
				status="ok"
				small
				onValueChange={onXChange}
				onValueChangeEnd={onXChangeEnd}
				onTextChange={onXTextChange}
				min={-Infinity}
				max={Infinity}
				step={1}
				formatter={formatter((dragX ?? parsed.x).unit)}
				rightAlign={false}
			/>
			<div style={{marginLeft: -6, marginRight: -6}} />
			<InputDragger
				type="number"
				value={dragY?.value ?? parsed.y.value}
				style={rightDraggerStyle}
				status="ok"
				small
				onValueChange={onYChange}
				onValueChangeEnd={onYChangeEnd}
				onTextChange={onYTextChange}
				min={-Infinity}
				max={Infinity}
				step={1}
				formatter={formatter((dragY ?? parsed.y).unit)}
				rightAlign={false}
			/>
		</span>
	);
};
