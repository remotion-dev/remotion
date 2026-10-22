import React, {useCallback, useContext, useMemo, useState} from 'react';
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
	normalizeTimelineNumber,
} from './timeline-field-utils';
import {
	parseTranslateWithUnits,
	serializeTranslateWithUnits,
} from './timeline-translate-utils';
import {UnsupportedStatus} from './TimelineSchemaField';
import {Transform3DModeContext} from './Transform3DModeContext';

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
	const [dragZ, setDragZ] = useState<number | null>(null);
	const transform3DMode = useContext(Transform3DModeContext);

	const parsedTranslate = useMemo(
		() => parseTranslateWithUnits(String(effectiveValue ?? '0px 0px')),
		[effectiveValue],
	);
	const codeX = parsedTranslate?.[0].value ?? 0;
	const codeY = parsedTranslate?.[1].value ?? 0;
	const codeZ = parsedTranslate?.[2]?.value ?? null;
	const show3D = transform3DMode || (codeZ !== null && codeZ !== 0);

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

	const formatCoordinate = useCallback(
		(v: number | string, unit: 'px' | '%') => {
			return `${formatTimelineNumber({
				decimalPlaces,
				fixed: false,
				value: normalizeTimelineNumber(Number(v)),
			})}${unit}`;
		},
		[decimalPlaces],
	);
	const serialize = useCallback(
		(x: number, y: number, z = dragZ ?? codeZ) => {
			return serializeTranslateWithUnits(
				[
					{value: x, unit: parsedTranslate?.[0].unit ?? 'px'},
					{value: y, unit: parsedTranslate?.[1].unit ?? 'px'},
					z === null ? null : {value: z, unit: 'px'},
				],
				decimalPlaces,
			);
		},
		[codeZ, decimalPlaces, dragZ, parsedTranslate],
	);

	// --- X callbacks ---
	const onXChange = useCallback(
		(newVal: number) => {
			setDragX(newVal);
			const currentY = dragY ?? codeY;
			onDragValueChange(serialize(newVal, currentY));
		},
		[codeY, dragY, onDragValueChange, serialize],
	);

	const onXChangeEnd = useCallback(
		(newVal: number) => {
			const currentY = dragY ?? codeY;
			const newStr = serialize(newVal, currentY);
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
		[codeY, dragY, onDragEnd, onSave, propStatus, serialize],
	);

	const onXTextChange = useCallback(
		(newVal: string) => {
			const parsed = Number(newVal);
			if (!Number.isNaN(parsed)) {
				const currentY = dragY ?? codeY;
				const newStr = serialize(parsed, currentY);
				if (newStr !== propStatus.codeValue) {
					setDragX(parsed);
					onSave(newStr).finally(() => {
						setDragX(null);
					});
				}
			}
		},
		[codeY, dragY, onSave, propStatus, serialize],
	);

	// --- Y callbacks ---
	const onYChange = useCallback(
		(newVal: number) => {
			setDragY(newVal);
			const currentX = dragX ?? codeX;
			onDragValueChange(serialize(currentX, newVal));
		},
		[codeX, dragX, onDragValueChange, serialize],
	);

	const onYChangeEnd = useCallback(
		(newVal: number) => {
			const currentX = dragX ?? codeX;
			const newStr = serialize(currentX, newVal);
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
		[codeX, dragX, onDragEnd, onSave, propStatus, serialize],
	);

	const onYTextChange = useCallback(
		(newVal: string) => {
			const parsed = Number(newVal);
			if (!Number.isNaN(parsed)) {
				const currentX = dragX ?? codeX;
				const newStr = serialize(currentX, parsed);
				if (newStr !== propStatus.codeValue) {
					setDragY(parsed);
					onSave(newStr).finally(() => {
						setDragY(null);
					});
				}
			}
		},
		[codeX, dragX, onSave, propStatus, serialize],
	);

	const onZChange = useCallback(
		(newVal: number) => {
			setDragZ(newVal);
			onDragValueChange(serialize(dragX ?? codeX, dragY ?? codeY, newVal));
		},
		[codeX, codeY, dragX, dragY, onDragValueChange, serialize],
	);

	const onZChangeEnd = useCallback(
		(newVal: number) => {
			const newStr = serialize(dragX ?? codeX, dragY ?? codeY, newVal);
			if (newStr !== propStatus.codeValue) {
				onSave(newStr).finally(() => {
					setDragZ(null);
					onDragEnd();
				});
			} else {
				setDragZ(null);
				onDragEnd();
			}
		},
		[codeX, codeY, dragX, dragY, onDragEnd, onSave, propStatus, serialize],
	);

	const onZTextChange = useCallback(
		(newVal: string) => {
			const parsed = Number(newVal);
			if (!Number.isNaN(parsed)) {
				const newStr = serialize(dragX ?? codeX, dragY ?? codeY, parsed);
				if (newStr !== propStatus.codeValue) {
					setDragZ(parsed);
					onSave(newStr).finally(() => setDragZ(null));
				}
			}
		},
		[codeX, codeY, dragX, dragY, onSave, propStatus, serialize],
	);

	if (parsedTranslate === null) {
		return (
			<UnsupportedStatus label="unsupported offset" formattedValue={false} />
		);
	}

	return (
		<span style={containerStyle}>
			<InputDragger
				type="number"
				value={dragX ?? codeX}
				buttonStyle={leftDraggerStyle}
				style={leftDraggerStyle}
				status="ok"
				small
				onValueChange={onXChange}
				onValueChangeEnd={onXChangeEnd}
				onTextChange={onXTextChange}
				min={-Infinity}
				max={Infinity}
				step={step}
				formatter={(value) => formatCoordinate(value, parsedTranslate[0].unit)}
				rightAlign={false}
				snapToStep={false}
				dragDecimalPlaces={decimalPlaces}
				dragSensitivity={translateDragSensitivity}
				aria-label="Offset X"
			/>
			<div style={{marginLeft: -6, marginRight: -6}} />
			<InputDragger
				type="number"
				value={dragY ?? codeY}
				buttonStyle={rightDraggerStyle}
				style={rightDraggerStyle}
				status="ok"
				small
				onValueChange={onYChange}
				onValueChangeEnd={onYChangeEnd}
				onTextChange={onYTextChange}
				min={-Infinity}
				max={Infinity}
				step={step}
				formatter={(value) => formatCoordinate(value, parsedTranslate[1].unit)}
				rightAlign={false}
				snapToStep={false}
				dragDecimalPlaces={decimalPlaces}
				dragSensitivity={translateDragSensitivity}
				aria-label="Offset Y"
			/>
			{show3D ? (
				<>
					<div style={{marginLeft: -6, marginRight: -6}} />
					<InputDragger
						type="number"
						value={dragZ ?? codeZ ?? 0}
						buttonStyle={rightDraggerStyle}
						style={rightDraggerStyle}
						status="ok"
						small
						onValueChange={onZChange}
						onValueChangeEnd={onZChangeEnd}
						onTextChange={onZTextChange}
						min={-Infinity}
						max={Infinity}
						step={step}
						formatter={(value) => formatCoordinate(value, 'px')}
						rightAlign={false}
						snapToStep={false}
						dragDecimalPlaces={decimalPlaces}
						dragSensitivity={translateDragSensitivity}
						aria-label="Offset Z"
					/>
				</>
			) : null}
		</span>
	);
};
