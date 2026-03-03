import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {CanUpdateSequencePropStatus} from 'remotion';
import type {SchemaFieldInfo} from '../../helpers/timeline-layout';
import {Checkbox} from '../Checkbox';
import {InputDragger} from '../NewComposition/InputDragger';
import {Spinner} from '../Spinner';

const getDecimalPlaces = (num: number): number => {
	const str = String(num);
	const decimalIndex = str.indexOf('.');
	return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
};

const unsupportedLabel: React.CSSProperties = {
	color: 'rgba(255, 255, 255, 0.4)',
	fontSize: 12,
	fontStyle: 'italic',
};

const draggerStyle: React.CSSProperties = {
	width: 80,
};

const checkboxContainer: React.CSSProperties = {
	marginLeft: 8,
};

const notEditableBackground: React.CSSProperties = {
	backgroundColor: 'rgba(255, 0, 0, 0.2)',
	borderRadius: 3,
	padding: '0 4px',
};

const TimelineNumberField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly codeValue: unknown;
	readonly canUpdate: boolean;
	readonly onSave: (key: string, value: unknown) => Promise<void>;
	readonly onDragValueChange: (key: string, value: unknown) => void;
	readonly onDragEnd: () => void;
}> = ({field, codeValue, canUpdate, onSave, onDragValueChange, onDragEnd}) => {
	const [dragValue, setDragValue] = useState<number | null>(null);
	const dragging = useRef(false);

	const onValueChange = useCallback(
		(newVal: number) => {
			dragging.current = true;
			setDragValue(newVal);
			onDragValueChange(field.key, newVal);
		},
		[onDragValueChange, field.key],
	);

	useEffect(() => {
		setDragValue(null);
		onDragEnd();
	}, [field.currentValue, onDragEnd]);

	const onValueChangeEnd = useCallback(
		(newVal: number) => {
			if (canUpdate && newVal !== codeValue) {
				onSave(field.key, newVal).catch(() => {
					setDragValue(null);
				});
			} else {
				setDragValue(null);
			}
		},
		[canUpdate, onSave, field.key, codeValue],
	);

	const onTextChange = useCallback(
		(newVal: string) => {
			if (canUpdate) {
				const parsed = Number(newVal);
				if (!Number.isNaN(parsed) && parsed !== codeValue) {
					setDragValue(parsed);
					onSave(field.key, parsed).catch(() => {
						setDragValue(null);
					});
				}
			}
		},
		[canUpdate, onSave, field.key, codeValue],
	);

	const step =
		field.fieldSchema.type === 'number' ? (field.fieldSchema.step ?? 1) : 1;

	const stepDecimals = useMemo(() => getDecimalPlaces(step), [step]);

	const formatter = useCallback(
		(v: number | string) => {
			const num = Number(v);
			const digits = Math.max(stepDecimals, getDecimalPlaces(num));
			return digits === 0 ? String(num) : num.toFixed(digits);
		},
		[stepDecimals],
	);

	return (
		<InputDragger
			type="number"
			value={dragValue ?? (codeValue as number)}
			style={draggerStyle}
			status="ok"
			small
			onValueChange={onValueChange}
			onValueChangeEnd={onValueChangeEnd}
			onTextChange={onTextChange}
			min={
				field.fieldSchema.type === 'number'
					? (field.fieldSchema.min ?? -Infinity)
					: -Infinity
			}
			max={
				field.fieldSchema.type === 'number'
					? (field.fieldSchema.max ?? Infinity)
					: Infinity
			}
			step={step}
			formatter={formatter}
			rightAlign={false}
		/>
	);
};

const TimelineBooleanField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly codeValue: unknown;
	readonly canUpdate: boolean;
	readonly onSave: (key: string, value: unknown) => Promise<void>;
}> = ({field, codeValue, canUpdate, onSave}) => {
	const checked = Boolean(codeValue);

	const onChange = useCallback(() => {
		if (canUpdate) {
			onSave(field.key, !checked);
		}
	}, [canUpdate, onSave, field.key, checked]);

	return (
		<div style={checkboxContainer}>
			<Checkbox
				checked={checked}
				onChange={onChange}
				name={field.key}
				disabled={!canUpdate}
			/>
		</div>
	);
};

export const TimelineFieldValue: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly onSave: (key: string, value: unknown) => Promise<void>;
	readonly onDragValueChange: (key: string, value: unknown) => void;
	readonly onDragEnd: () => void;
	readonly canUpdate: boolean;
	readonly propStatus: CanUpdateSequencePropStatus | null;
	readonly effectiveValue: unknown;
}> = ({
	field,
	onSave,
	onDragValueChange,
	onDragEnd,
	propStatus,
	canUpdate,
	effectiveValue,
}) => {
	const wrapperStyle: React.CSSProperties | undefined =
		canUpdate === null || canUpdate === false
			? notEditableBackground
			: undefined;

	if (!field.supported) {
		return <span style={unsupportedLabel}>unsupported</span>;
	}

	if (propStatus !== null && !propStatus.canUpdate) {
		return <span style={unsupportedLabel}>{propStatus.reason}</span>;
	}

	if (propStatus === null) {
		return (
			<span style={{...notEditableBackground}}>
				<span style={unsupportedLabel}>error</span>
			</span>
		);
	}

	if (field.typeName === 'number') {
		return (
			<span style={wrapperStyle}>
				<TimelineNumberField
					field={field}
					codeValue={effectiveValue}
					canUpdate={canUpdate}
					onSave={onSave}
					onDragValueChange={onDragValueChange}
					onDragEnd={onDragEnd}
				/>
			</span>
		);
	}

	if (field.typeName === 'boolean') {
		return (
			<span style={wrapperStyle}>
				<TimelineBooleanField
					field={field}
					codeValue={effectiveValue}
					canUpdate={canUpdate}
					onSave={onSave}
				/>
			</span>
		);
	}

	return (
		<span style={{...unsupportedLabel, fontStyle: 'normal'}}>
			{String(effectiveValue)}
		</span>
	);
};

export const TimelineFieldSavingSpinner: React.FC<{
	readonly saving: boolean;
}> = ({saving}) => {
	if (!saving) {
		return null;
	}

	return <Spinner duration={0.5} size={12} />;
};
