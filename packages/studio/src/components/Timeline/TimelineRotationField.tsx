import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {SchemaFieldInfo} from '../../helpers/timeline-layout';
import {InputDragger} from '../NewComposition/InputDragger';
import {draggerStyle, getDecimalPlaces} from './timeline-field-utils';

const parseCssRotationToDegrees = (value: string): number => {
	try {
		const m = new DOMMatrix(`rotate(${value})`);
		return Math.round(Math.atan2(m.b, m.a) * (180 / Math.PI) * 1e6) / 1e6;
	} catch {
		return 0;
	}
};

export const TimelineRotationField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly codeValue: unknown;
	readonly canUpdate: boolean;
	readonly onSave: (key: string, value: unknown) => Promise<void>;
	readonly onDragValueChange: (key: string, value: unknown) => void;
	readonly onDragEnd: () => void;
}> = ({field, codeValue, canUpdate, onSave, onDragValueChange, onDragEnd}) => {
	const [dragValue, setDragValue] = useState<number | null>(null);

	const degrees = useMemo(
		() => parseCssRotationToDegrees(String(codeValue ?? '0deg')),
		[codeValue],
	);

	const onValueChange = useCallback(
		(newVal: number) => {
			setDragValue(newVal);
			onDragValueChange(field.key, `${newVal}deg`);
		},
		[onDragValueChange, field.key],
	);

	useEffect(() => {
		setDragValue(null);
		onDragEnd();
	}, [field.currentValue, onDragEnd]);

	const onValueChangeEnd = useCallback(
		(newVal: number) => {
			const newStr = `${newVal}deg`;
			if (canUpdate && newStr !== codeValue) {
				onSave(field.key, newStr).catch(() => {
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
				if (!Number.isNaN(parsed)) {
					const newStr = `${parsed}deg`;
					if (newStr !== codeValue) {
						setDragValue(parsed);
						onSave(field.key, newStr).catch(() => {
							setDragValue(null);
						});
					}
				}
			}
		},
		[canUpdate, onSave, field.key, codeValue],
	);

	const step =
		field.fieldSchema.type === 'rotation' ? (field.fieldSchema.step ?? 1) : 1;

	const stepDecimals = useMemo(() => getDecimalPlaces(step), [step]);

	const formatter = useCallback(
		(v: number | string) => {
			const num = Number(v);
			const digits = Math.max(stepDecimals, getDecimalPlaces(num));
			const formatted = digits === 0 ? String(num) : num.toFixed(digits);
			return `${formatted}\u00B0`;
		},
		[stepDecimals],
	);

	return (
		<InputDragger
			type="number"
			value={dragValue ?? degrees}
			style={draggerStyle}
			status="ok"
			small
			onValueChange={onValueChange}
			onValueChangeEnd={onValueChangeEnd}
			onTextChange={onTextChange}
			min={-Infinity}
			max={Infinity}
			step={step}
			formatter={formatter}
			rightAlign={false}
		/>
	);
};
