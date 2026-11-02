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
import {useTimelineFieldEdit} from './use-timeline-field-edit';

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
	readonly onDragEnd: TimelineFieldOnDragEnd;
}> = ({
	field,
	propStatus,
	effectiveValue,
	onSave,
	onDragValueChange,
	onDragEnd,
}) => {
	const {markEdit, finishEdit} = useTimelineFieldEdit();
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
	const onValueChangeCancel = useCallback(() => {
		markEdit();
		setDragX(null);
		setDragY(null);
		setDragZ(null);
		onDragEnd('cancel');
	}, [markEdit, onDragEnd]);

	const onXChange = useCallback(
		(newVal: number) => {
			markEdit();
			setDragX(newVal);
			const currentY = dragY ?? codeY;
			onDragValueChange(serialize(newVal, currentY));
		},
		[codeY, dragY, onDragValueChange, serialize, markEdit],
	);

	const onXChangeEnd = useCallback(
		(newVal: number) => {
			markEdit();
			const currentY = dragY ?? codeY;
			const newStr = serialize(newVal, currentY);
			if (newStr !== propStatus.codeValue) {
				finishEdit(onSave(newStr), () => {
					setDragX(null);
					onDragEnd('commit');
				});
			} else {
				setDragX(null);
				onDragEnd('cancel');
			}
		},
		[
			codeY,
			dragY,
			onDragEnd,
			onSave,
			propStatus,
			serialize,
			markEdit,
			finishEdit,
		],
	);

	const onXTextChange = useCallback(
		(newVal: string) => {
			const parsed = Number(newVal);
			if (!Number.isNaN(parsed)) {
				const currentY = dragY ?? codeY;
				const newStr = serialize(parsed, currentY);
				if (newStr !== propStatus.codeValue) {
					markEdit();
					setDragX(parsed);
					finishEdit(onSave(newStr), () => {
						setDragX(null);
					});
				}
			}
		},
		[codeY, dragY, onSave, propStatus, serialize, markEdit, finishEdit],
	);

	// --- Y callbacks ---
	const onYChange = useCallback(
		(newVal: number) => {
			markEdit();
			setDragY(newVal);
			const currentX = dragX ?? codeX;
			onDragValueChange(serialize(currentX, newVal));
		},
		[codeX, dragX, onDragValueChange, serialize, markEdit],
	);

	const onYChangeEnd = useCallback(
		(newVal: number) => {
			markEdit();
			const currentX = dragX ?? codeX;
			const newStr = serialize(currentX, newVal);
			if (newStr !== propStatus.codeValue) {
				finishEdit(onSave(newStr), () => {
					setDragY(null);
					onDragEnd('commit');
				});
			} else {
				setDragY(null);
				onDragEnd('cancel');
			}
		},
		[
			codeX,
			dragX,
			onDragEnd,
			onSave,
			propStatus,
			serialize,
			markEdit,
			finishEdit,
		],
	);

	const onYTextChange = useCallback(
		(newVal: string) => {
			const parsed = Number(newVal);
			if (!Number.isNaN(parsed)) {
				const currentX = dragX ?? codeX;
				const newStr = serialize(currentX, parsed);
				if (newStr !== propStatus.codeValue) {
					markEdit();
					setDragY(parsed);
					finishEdit(onSave(newStr), () => {
						setDragY(null);
					});
				}
			}
		},
		[codeX, dragX, onSave, propStatus, serialize, markEdit, finishEdit],
	);

	const onZChange = useCallback(
		(newVal: number) => {
			markEdit();
			setDragZ(newVal);
			onDragValueChange(serialize(dragX ?? codeX, dragY ?? codeY, newVal));
		},
		[codeX, codeY, dragX, dragY, onDragValueChange, serialize, markEdit],
	);

	const onZChangeEnd = useCallback(
		(newVal: number) => {
			markEdit();
			const newStr = serialize(dragX ?? codeX, dragY ?? codeY, newVal);
			if (newStr !== propStatus.codeValue) {
				finishEdit(onSave(newStr), () => {
					setDragZ(null);
					onDragEnd('commit');
				});
			} else {
				setDragZ(null);
				onDragEnd('cancel');
			}
		},
		[
			codeX,
			codeY,
			dragX,
			dragY,
			onDragEnd,
			onSave,
			propStatus,
			serialize,
			markEdit,
			finishEdit,
		],
	);

	const onZTextChange = useCallback(
		(newVal: string) => {
			const parsed = Number(newVal);
			if (!Number.isNaN(parsed)) {
				const newStr = serialize(dragX ?? codeX, dragY ?? codeY, parsed);
				if (newStr !== propStatus.codeValue) {
					markEdit();
					setDragZ(parsed);
					finishEdit(onSave(newStr), () => setDragZ(null));
				}
			}
		},
		[
			codeX,
			codeY,
			dragX,
			dragY,
			onSave,
			propStatus,
			serialize,
			markEdit,
			finishEdit,
		],
	);

	if (parsedTranslate === null) {
		return (
			<UnsupportedStatus label="unsupported offset" formattedValue={false} />
		);
	}

	return (
		<span style={containerStyle}>
			<InputDragger
				onValueChangeCancel={onValueChangeCancel}
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
				onValueChangeCancel={onValueChangeCancel}
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
						onValueChangeCancel={onValueChangeCancel}
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
