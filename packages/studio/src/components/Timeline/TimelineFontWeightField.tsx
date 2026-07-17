import React, {useCallback, useMemo, useState} from 'react';
import type {CanUpdateSequencePropStatusStatic} from 'remotion';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import {InputDragger} from '../NewComposition/InputDragger';
import {
	fontWeightToNumericValue,
	resolveFontWeightSave,
} from './font-weight-utils';
import {draggerStyle} from './timeline-field-utils';

const comboboxStyle: React.CSSProperties = {
	marginLeft: 8,
};

export const TimelineFontWeightField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly effectiveValue: unknown;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly onSave: TimelineFieldOnSave;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: () => void;
}> = ({
	field,
	effectiveValue,
	propStatus,
	onSave,
	onDragValueChange,
	onDragEnd,
}) => {
	const {fieldSchema} = field;
	if (fieldSchema.type !== 'font-weight') {
		throw new Error(
			'TimelineFontWeightField rendered for non-font-weight field',
		);
	}

	const [dragValue, setDragValue] = useState<number | null>(null);

	const min = fieldSchema.min ?? 1;
	const max = fieldSchema.max ?? 1000;
	const step = fieldSchema.step ?? 1;

	const displayNumber =
		dragValue ??
		fontWeightToNumericValue(effectiveValue) ??
		fontWeightToNumericValue(fieldSchema.default);

	const saveNumber = useCallback(
		(newVal: number) => {
			const decision = resolveFontWeightSave({
				stored: propStatus.codeValue,
				newValue: newVal,
				min,
				max,
			});

			if (decision.type === 'skip') {
				setDragValue(null);
				onDragEnd();
				return;
			}

			onSave(decision.value).finally(() => {
				setDragValue(null);
				onDragEnd();
			});
		},
		[max, min, onDragEnd, onSave, propStatus.codeValue],
	);

	const onValueChange = useCallback(
		(newVal: number) => {
			setDragValue(newVal);
			onDragValueChange(newVal);
		},
		[onDragValueChange],
	);

	const onTextChange = useCallback(
		(newVal: string) => {
			const parsed = Number(newVal);
			if (newVal.trim() !== '' && Number.isFinite(parsed)) {
				saveNumber(parsed);
			}
		},
		[saveNumber],
	);

	const onSelectPreset = useCallback(
		(preset: number | string) => {
			if (preset === propStatus.codeValue) {
				return;
			}

			onDragValueChange(preset);
			onSave(preset).finally(() => {
				onDragEnd();
			});
		},
		[onDragEnd, onDragValueChange, onSave, propStatus.codeValue],
	);

	const presetItems = useMemo<ComboboxValue[]>(() => {
		return fieldSchema.presets.map((preset) => ({
			type: 'item',
			id: String(preset),
			value: String(preset),
			label: String(preset),
			onClick: () => onSelectPreset(preset),
			keyHint: null,
			leftItem: null,
			subMenu: null,
			quickSwitcherLabel: null,
			disabled: false,
		}));
	}, [fieldSchema.presets, onSelectPreset]);

	const selectedPresetId =
		effectiveValue === undefined ? '' : String(effectiveValue);

	const formatter = useCallback((value: number | string) => {
		const numeric = Number(value);
		return Number.isFinite(numeric) ? String(numeric) : String(value);
	}, []);

	return (
		<span>
			<InputDragger
				type="number"
				value={displayNumber ?? ''}
				style={draggerStyle}
				status="ok"
				small
				onValueChange={onValueChange}
				onValueChangeEnd={saveNumber}
				onTextChange={onTextChange}
				min={min}
				max={max}
				step={step}
				formatter={formatter}
				rightAlign={false}
			/>
			<Combobox
				small
				title={field.key}
				selectedId={selectedPresetId}
				values={presetItems}
				style={comboboxStyle}
			/>
		</span>
	);
};
