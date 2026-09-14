import React, {useRef, useState} from 'react';
import {noop} from '../../helpers/noop';
import type {SchemaFieldInfo} from '../../helpers/timeline-layout';
import {InputDragger} from '../NewComposition/InputDragger';
import {formatTimelineFieldValueForDisplay} from '../Timeline/timeline-field-display-utils';
import {
	getDecimalPlaces,
	getTimelineDisplayDecimalPlaces,
	roundToDecimalPlaces,
} from '../Timeline/timeline-field-utils';
import {
	parseTranslate,
	serializeTranslate,
} from '../Timeline/timeline-translate-utils';

const NumericAxis: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly values: unknown[];
	readonly axis: 0 | 1 | 2 | null;
	readonly onPreview: (values: unknown[]) => void;
	readonly onSave: (values: unknown[]) => Promise<void>;
	readonly onClear: () => void;
}> = ({field, values, axis, onPreview, onSave, onClear}) => {
	const [dragValue, setDragValue] = useState<number | null>(null);
	const initialValues = useRef<unknown[] | null>(null);
	const coordinates = values.map((value) =>
		axis === null ? Number(value) : (parseTranslate(String(value))[axis] ?? 0),
	);
	const mixed = coordinates.some((value) => value !== coordinates[0]);
	const schema = field.fieldSchema;
	const step = 'step' in schema ? (schema.step ?? 1) : 1;
	const decimalPlaces = getTimelineDisplayDecimalPlaces({
		defaultDecimalPlaces: 1,
		step,
	});
	const min = schema.type === 'number' ? (schema.min ?? -Infinity) : -Infinity;
	const max = schema.type === 'number' ? (schema.max ?? Infinity) : Infinity;
	const nextValues = (value: number, source: 'input' | 'drag') => {
		const baseline = initialValues.current ?? values;
		const first =
			axis === null
				? Number(baseline[0])
				: (parseTranslate(String(baseline[0]))[axis] ?? 0);
		return baseline.map((original) => {
			const coordinatesForValue =
				axis === null ? null : parseTranslate(String(original));
			const current =
				coordinatesForValue === null || axis === null
					? Number(original)
					: (coordinatesForValue[axis] ?? 0);
			const next = Math.min(
				max,
				Math.max(
					min,
					source === 'drag'
						? roundToDecimalPlaces(
								current + value - first,
								Math.max(
									getDecimalPlaces(current),
									getDecimalPlaces(value),
									getDecimalPlaces(first),
								),
							)
						: value,
				),
			);
			if (coordinatesForValue === null || axis === null) {
				return next;
			}

			const [x, y, z] = coordinatesForValue;
			return serializeTranslate(
				[axis === 0 ? next : x, axis === 1 ? next : y, axis === 2 ? next : z],
				decimalPlaces,
			);
		});
	};

	const clear = () => {
		initialValues.current = null;
		setDragValue(null);
		onClear();
	};

	return (
		<span
			onKeyDownCapture={(event) => {
				if (event.key === 'Escape') {
					clear();
				}
			}}
			onPointerCancelCapture={clear}
			onBlurCapture={(event) => {
				if (
					event.target instanceof HTMLInputElement &&
					event.target.value.trim() === ''
				) {
					clear();
				}
			}}
		>
			<InputDragger
				type="number"
				value={dragValue ?? coordinates[0]}
				aria-label={
					axis === null
						? (field.description ?? field.key)
						: `Offset ${['X', 'Y', 'Z'][axis]}`
				}
				title="Type to set all values; drag to adjust each value"
				status="ok"
				small
				rightAlign={false}
				min={min}
				max={max}
				step={step}
				snapToStep={axis === null}
				dragDecimalPlaces={decimalPlaces}
				dragSensitivity={axis === null ? 1 : 3}
				buttonStyle={{paddingLeft: 0}}
				style={{width: 70}}
				formatter={(value) =>
					mixed && dragValue === null
						? 'Mixed'
						: formatTimelineFieldValueForDisplay({fieldSchema: schema, value})
				}
				onTextChange={noop}
				onValueChange={(value, source) => {
					initialValues.current ??= values;
					setDragValue(value);
					onPreview(nextValues(value, source));
				}}
				onValueChangeEnd={(value, source) => {
					if (initialValues.current === null) {
						return;
					}

					onSave(nextValues(value, source)).finally(clear);
				}}
			/>
		</span>
	);
};

export const MultiSequenceNumberField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly values: unknown[];
	readonly onPreview: (values: unknown[]) => void;
	readonly onSave: (values: unknown[]) => Promise<void>;
	readonly onClear: () => void;
}> = (props) => {
	const axes: (0 | 1 | 2 | null)[] =
		props.field.typeName === 'translate'
			? props.values.some((value) => parseTranslate(String(value))[2] !== null)
				? [0, 1, 2]
				: [0, 1]
			: [null];
	return (
		<span style={{display: 'flex', gap: 4}}>
			{axes.map((axis) => (
				<NumericAxis key={axis ?? 'value'} {...props} axis={axis} />
			))}
		</span>
	);
};
