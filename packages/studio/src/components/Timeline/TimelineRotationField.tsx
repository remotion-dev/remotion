import React, {useCallback, useMemo, useState} from 'react';
import type {CanUpdateSequencePropStatus} from 'remotion';
import type {SchemaFieldInfo} from '../../helpers/timeline-layout';
import {InputDragger} from '../NewComposition/InputDragger';
import {draggerStyle, getDecimalPlaces} from './timeline-field-utils';

const unitPattern = /^([+-]?(?:\d+\.?\d*|\.\d+))(deg|rad|turn|grad)$/;

const unitToDegrees: Record<string, number> = {
	deg: 1,
	rad: 180 / Math.PI,
	turn: 360,
	grad: 360 / 400,
};

const parseCssRotationToDegrees = (value: string): number => {
	const match = value.trim().match(unitPattern);
	if (match) {
		return Number(match[1]) * unitToDegrees[match[2]];
	}

	try {
		const m = new DOMMatrix(`rotate(${value})`);
		return Math.round(Math.atan2(m.b, m.a) * (180 / Math.PI) * 1e6) / 1e6;
	} catch {
		return 0;
	}
};

export const TimelineRotationField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly effectiveValue: unknown;
	readonly propStatus: CanUpdateSequencePropStatus;
	readonly onSave: (value: unknown) => Promise<void>;
	readonly onDragValueChange: (value: unknown) => void;
	readonly onDragEnd: () => void;
}> = ({
	field,
	effectiveValue,
	propStatus,
	onSave,
	onDragValueChange,
	onDragEnd,
}) => {
	const [dragValue, setDragValue] = useState<number | null>(null);

	const degrees = useMemo(
		() => parseCssRotationToDegrees(String(effectiveValue ?? '0deg')),
		[effectiveValue],
	);

	const onValueChange = useCallback(
		(newVal: number) => {
			setDragValue(newVal);
			onDragValueChange(`${newVal}deg`);
		},
		[onDragValueChange],
	);

	const onValueChangeEnd = useCallback(
		(newVal: number) => {
			const newStr = `${newVal}deg`;
			if (propStatus.canUpdate && newStr !== propStatus.codeValue) {
				onSave(newStr).finally(() => {
					setDragValue(null);
					onDragEnd();
				});
			} else {
				setDragValue(null);
				onDragEnd();
			}
		},
		[propStatus, onSave, onDragEnd],
	);

	const onTextChange = useCallback(
		(newVal: string) => {
			if (propStatus.canUpdate) {
				const parsed = Number(newVal);
				if (!Number.isNaN(parsed)) {
					const newStr = `${parsed}deg`;
					if (newStr !== propStatus.codeValue) {
						setDragValue(parsed);
						onSave(newStr).catch(() => {
							setDragValue(null);
						});
					}
				}
			}
		},
		[propStatus, onSave],
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
