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
import {parseTranslate, serializeTranslate} from './timeline-translate-utils';

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

const translateDragSensitivity = 3;

export const TimelineTranslateField: React.FC<{
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
		() => parseTranslate(String(effectiveValue ?? '0px 0px')),
		[effectiveValue],
	);

	const configuredStep =
		field.fieldSchema.type === 'translate' ? field.fieldSchema.step : undefined;
	const step = configuredStep ?? 1;

	const decimalPlaces = useMemo(
		() =>
			getTimelineDisplayDecimalPlaces({
				defaultDecimalPlaces: 1,
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

	// --- X callbacks ---
	const onXChange = useCallback(
		(newVal: number) => {
			setDragX(newVal);
			const currentY = dragY ?? codeY;
			onDragValueChange(serializeTranslate(newVal, currentY, decimalPlaces));
		},
		[onDragValueChange, dragY, codeY, decimalPlaces],
	);

	const onXChangeEnd = useCallback(
		(newVal: number) => {
			const currentY = dragY ?? codeY;
			const newStr = serializeTranslate(newVal, currentY, decimalPlaces);
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
		[dragY, codeY, decimalPlaces, propStatus, onSave, onDragEnd],
	);

	const onXTextChange = useCallback(
		(newVal: string) => {
			const parsed = Number(newVal);
			if (!Number.isNaN(parsed)) {
				const currentY = dragY ?? codeY;
				const newStr = serializeTranslate(parsed, currentY, decimalPlaces);
				if (newStr !== propStatus.codeValue) {
					setDragX(parsed);
					onSave(newStr).finally(() => {
						setDragX(null);
					});
				}
			}
		},
		[propStatus, dragY, codeY, decimalPlaces, onSave],
	);

	// --- Y callbacks ---
	const onYChange = useCallback(
		(newVal: number) => {
			setDragY(newVal);
			const currentX = dragX ?? codeX;
			onDragValueChange(serializeTranslate(currentX, newVal, decimalPlaces));
		},
		[onDragValueChange, dragX, codeX, decimalPlaces],
	);

	const onYChangeEnd = useCallback(
		(newVal: number) => {
			const currentX = dragX ?? codeX;
			const newStr = serializeTranslate(currentX, newVal, decimalPlaces);
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
		[dragX, codeX, decimalPlaces, propStatus, onSave, onDragEnd],
	);

	const onYTextChange = useCallback(
		(newVal: string) => {
			const parsed = Number(newVal);
			if (!Number.isNaN(parsed)) {
				const currentX = dragX ?? codeX;
				const newStr = serializeTranslate(currentX, parsed, decimalPlaces);
				if (newStr !== propStatus.codeValue) {
					setDragY(parsed);
					onSave(newStr).finally(() => {
						setDragY(null);
					});
				}
			}
		},
		[propStatus, onSave, dragX, codeX, decimalPlaces],
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
				min={-Infinity}
				max={Infinity}
				step={step}
				formatter={formatter}
				rightAlign={false}
				snapToStep={false}
				dragDecimalPlaces={decimalPlaces}
				dragSensitivity={translateDragSensitivity}
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
				min={-Infinity}
				max={Infinity}
				step={step}
				formatter={formatter}
				rightAlign={false}
				snapToStep={false}
				dragDecimalPlaces={decimalPlaces}
				dragSensitivity={translateDragSensitivity}
			/>
		</span>
	);
};
