import React, {useCallback, useMemo, useState} from 'react';
import type {CanUpdateSequencePropStatusStatic} from 'remotion';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {InputDragger} from '../NewComposition/InputDragger';
import {
	getDecimalPlaces,
	normalizeTimelineNumber,
} from './timeline-field-utils';
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

	const step =
		field.fieldSchema.type === 'translate' ? (field.fieldSchema.step ?? 1) : 1;

	const stepDecimals = useMemo(() => getDecimalPlaces(step), [step]);

	const formatter = useCallback(
		(v: number | string) => {
			const num = normalizeTimelineNumber(Number(v));
			const digits = Math.max(stepDecimals, getDecimalPlaces(num));
			const formatted = digits === 0 ? String(num) : num.toFixed(digits);
			return `${formatted}px`;
		},
		[stepDecimals],
	);

	// --- X callbacks ---
	const onXChange = useCallback(
		(newVal: number) => {
			setDragX(newVal);
			const currentY = dragY ?? codeY;
			onDragValueChange(serializeTranslate(newVal, currentY));
		},
		[onDragValueChange, dragY, codeY],
	);

	const onXChangeEnd = useCallback(
		(newVal: number) => {
			const currentY = dragY ?? codeY;
			const newStr = serializeTranslate(newVal, currentY);
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
		[dragY, codeY, propStatus, onSave, onDragEnd],
	);

	const onXTextChange = useCallback(
		(newVal: string) => {
			const parsed = Number(newVal);
			if (!Number.isNaN(parsed)) {
				const currentY = dragY ?? codeY;
				const newStr = serializeTranslate(parsed, currentY);
				if (newStr !== propStatus.codeValue) {
					setDragX(parsed);
					onSave(newStr).finally(() => {
						setDragX(null);
					});
				}
			}
		},
		[propStatus, dragY, codeY, onSave],
	);

	// --- Y callbacks ---
	const onYChange = useCallback(
		(newVal: number) => {
			setDragY(newVal);
			const currentX = dragX ?? codeX;
			onDragValueChange(serializeTranslate(currentX, newVal));
		},
		[onDragValueChange, dragX, codeX],
	);

	const onYChangeEnd = useCallback(
		(newVal: number) => {
			const currentX = dragX ?? codeX;
			const newStr = serializeTranslate(currentX, newVal);
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
		[dragX, codeX, propStatus, onSave, onDragEnd],
	);

	const onYTextChange = useCallback(
		(newVal: string) => {
			const parsed = Number(newVal);
			if (!Number.isNaN(parsed)) {
				const currentX = dragX ?? codeX;
				const newStr = serializeTranslate(currentX, parsed);
				if (newStr !== propStatus.codeValue) {
					setDragY(parsed);
					onSave(newStr).finally(() => {
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
				min={-Infinity}
				max={Infinity}
				step={step}
				formatter={formatter}
				rightAlign={false}
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
			/>
		</span>
	);
};
