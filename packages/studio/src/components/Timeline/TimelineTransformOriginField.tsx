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
import {UnsupportedStatus} from './TimelineSchemaField';
import {
	parseTransformOrigin,
	parsedTransformOriginToPercent,
	serializeTransformOrigin,
	transformOriginPercentToUv,
} from './transform-origin-utils';

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
	const [dragX, setDragX] = useState<number | null>(null);
	const [dragY, setDragY] = useState<number | null>(null);

	const parsed = useMemo(
		() => parseTransformOrigin(effectiveValue),
		[effectiveValue],
	);
	const percent = useMemo(
		() => (parsed === null ? null : parsedTransformOriginToPercent(parsed)),
		[parsed],
	);

	const configuredStep =
		field.fieldSchema.type === 'transform-origin'
			? field.fieldSchema.step
			: undefined;
	const step = configuredStep ?? 1;

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

	const serialize = useCallback(
		(x: number, y: number) => {
			return serializeTransformOrigin({
				uv: transformOriginPercentToUv([x, y]),
				z: parsed?.z ?? null,
				decimalPlaces,
			});
		},
		[decimalPlaces, parsed?.z],
	);

	const onXChange = useCallback(
		(newVal: number) => {
			if (percent === null) {
				return;
			}

			setDragX(newVal);
			const currentY = dragY ?? percent[1];
			onDragValueChange(serialize(newVal, currentY));
		},
		[dragY, onDragValueChange, percent, serialize],
	);

	const onXChangeEnd = useCallback(
		(newVal: number) => {
			if (percent === null) {
				return;
			}

			const currentY = dragY ?? percent[1];
			const value = serialize(newVal, currentY);
			if (value !== propStatus.codeValue) {
				onSave(value).finally(() => {
					setDragX(null);
					onDragEnd();
				});
			} else {
				setDragX(null);
				onDragEnd();
			}
		},
		[dragY, onDragEnd, onSave, percent, propStatus.codeValue, serialize],
	);

	const onXTextChange = useCallback(
		(newVal: string) => {
			if (percent === null) {
				return;
			}

			const parsedValue = Number(newVal);
			if (!Number.isNaN(parsedValue)) {
				const currentY = dragY ?? percent[1];
				const value = serialize(parsedValue, currentY);
				if (value !== propStatus.codeValue) {
					setDragX(parsedValue);
					onSave(value).finally(() => {
						setDragX(null);
					});
				}
			}
		},
		[dragY, onSave, percent, propStatus.codeValue, serialize],
	);

	const onYChange = useCallback(
		(newVal: number) => {
			if (percent === null) {
				return;
			}

			setDragY(newVal);
			const currentX = dragX ?? percent[0];
			onDragValueChange(serialize(currentX, newVal));
		},
		[dragX, onDragValueChange, percent, serialize],
	);

	const onYChangeEnd = useCallback(
		(newVal: number) => {
			if (percent === null) {
				return;
			}

			const currentX = dragX ?? percent[0];
			const value = serialize(currentX, newVal);
			if (value !== propStatus.codeValue) {
				onSave(value).finally(() => {
					setDragY(null);
					onDragEnd();
				});
			} else {
				setDragY(null);
				onDragEnd();
			}
		},
		[dragX, onDragEnd, onSave, percent, propStatus.codeValue, serialize],
	);

	const onYTextChange = useCallback(
		(newVal: string) => {
			if (percent === null) {
				return;
			}

			const parsedValue = Number(newVal);
			if (!Number.isNaN(parsedValue)) {
				const currentX = dragX ?? percent[0];
				const value = serialize(currentX, parsedValue);
				if (value !== propStatus.codeValue) {
					setDragY(parsedValue);
					onSave(value).finally(() => {
						setDragY(null);
					});
				}
			}
		},
		[dragX, onSave, percent, propStatus.codeValue, serialize],
	);

	if (percent === null) {
		return <UnsupportedStatus label="unsupported origin" />;
	}

	return (
		<span style={containerStyle}>
			<InputDragger
				type="number"
				value={dragX ?? percent[0]}
				style={leftDraggerStyle}
				status="ok"
				small
				onValueChange={onXChange}
				onValueChangeEnd={onXChangeEnd}
				onTextChange={onXTextChange}
				min={-Infinity}
				max={Infinity}
				step={step}
				formatter={formatter}
				rightAlign={false}
				snapToStep={false}
				dragDecimalPlaces={decimalPlaces}
			/>
			<div style={{marginLeft: -6, marginRight: -6}} />
			<InputDragger
				type="number"
				value={dragY ?? percent[1]}
				style={rightDraggerStyle}
				status="ok"
				small
				onValueChange={onYChange}
				onValueChangeEnd={onYChangeEnd}
				onTextChange={onYTextChange}
				min={-Infinity}
				max={Infinity}
				step={step}
				formatter={formatter}
				rightAlign={false}
				snapToStep={false}
				dragDecimalPlaces={decimalPlaces}
			/>
		</span>
	);
};
