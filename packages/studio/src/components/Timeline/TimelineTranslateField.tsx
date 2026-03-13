import React, {useCallback, useMemo, useState} from 'react';
import type {SchemaFieldInfo} from '../../helpers/timeline-layout';
import {InputDragger} from '../NewComposition/InputDragger';
import {getDecimalPlaces} from './timeline-field-utils';

const leftDraggerStyle: React.CSSProperties = {
	paddingLeft: 0,
};

const rightDraggerStyle: React.CSSProperties = {
	paddingRight: 0,
};

const PIXEL_PATTERN = /^(-?\d+(?:\.\d+)?)px(?:\s+(-?\d+(?:\.\d+)?)px)?$/;

const parseTranslate = (value: string): [number, number] => {
	const m = value.match(PIXEL_PATTERN);
	if (!m) {
		return [0, 0];
	}

	return [Number(m[1]), m[2] !== undefined ? Number(m[2]) : 0];
};

const containerStyle: React.CSSProperties = {
	display: 'flex',
	gap: 4,
};

export const TimelineTranslateField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly codeValue: unknown;
	readonly effectiveValue: unknown;
	readonly canUpdate: boolean;
	readonly onSave: (key: string, value: unknown) => Promise<void>;
	readonly onDragValueChange: (key: string, value: unknown) => void;
	readonly onDragEnd: () => void;
}> = ({
	field,
	codeValue,
	effectiveValue,
	canUpdate,
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

	const makeString = useCallback((x: number, y: number) => `${x}px ${y}px`, []);

	const step =
		field.fieldSchema.type === 'translate' ? (field.fieldSchema.step ?? 1) : 1;

	const stepDecimals = useMemo(() => getDecimalPlaces(step), [step]);

	const formatter = useCallback(
		(v: number | string) => {
			const num = Number(v);
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
			onDragValueChange(field.key, makeString(newVal, currentY));
		},
		[onDragValueChange, field.key, dragY, codeY, makeString],
	);

	const onXChangeEnd = useCallback(
		(newVal: number) => {
			const currentY = dragY ?? codeY;
			const newStr = makeString(newVal, currentY);
			if (canUpdate && newStr !== codeValue) {
				onSave(field.key, newStr).finally(() => {
					setDragX(null);
					onDragEnd();
				});
			} else {
				setDragX(null);
				onDragEnd();
			}
		},
		[
			dragY,
			codeY,
			makeString,
			canUpdate,
			codeValue,
			onSave,
			field.key,
			onDragEnd,
		],
	);

	const onXTextChange = useCallback(
		(newVal: string) => {
			if (canUpdate) {
				const parsed = Number(newVal);
				if (!Number.isNaN(parsed)) {
					const currentY = dragY ?? codeY;
					const newStr = makeString(parsed, currentY);
					if (newStr !== codeValue) {
						setDragX(parsed);
						onSave(field.key, newStr);
					}
				}
			}
		},
		[canUpdate, dragY, codeY, makeString, codeValue, onSave, field.key],
	);

	// --- Y callbacks ---
	const onYChange = useCallback(
		(newVal: number) => {
			setDragY(newVal);
			const currentX = dragX ?? codeX;
			onDragValueChange(field.key, makeString(currentX, newVal));
		},
		[onDragValueChange, field.key, dragX, codeX, makeString],
	);

	const onYChangeEnd = useCallback(
		(newVal: number) => {
			const currentX = dragX ?? codeX;
			const newStr = makeString(currentX, newVal);
			if (canUpdate && newStr !== codeValue) {
				onSave(field.key, newStr).finally(() => {
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
			codeX,
			makeString,
			canUpdate,
			codeValue,
			onSave,
			field.key,
			onDragEnd,
		],
	);

	const onYTextChange = useCallback(
		(newVal: string) => {
			if (canUpdate) {
				const parsed = Number(newVal);
				if (!Number.isNaN(parsed)) {
					const currentX = dragX ?? codeX;
					const newStr = makeString(currentX, parsed);
					if (newStr !== codeValue) {
						setDragY(parsed);
						onSave(field.key, newStr).catch(() => {
							setDragY(null);
						});
					}
				}
			}
		},
		[canUpdate, onSave, field.key, codeValue, dragX, codeX, makeString],
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
