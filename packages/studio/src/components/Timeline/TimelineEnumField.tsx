import React, {useCallback, useMemo} from 'react';
import type {CanUpdateSequencePropStatusStatic} from 'remotion';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';

const comboboxStyle: React.CSSProperties = {
	marginLeft: 8,
};

export const TimelineEnumField: React.FC<{
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
	const {fieldSchema} = field;
	if (fieldSchema.type !== 'enum') {
		throw new Error('TimelineEnumField rendered for non-enum field');
	}

	const variantKeys = Object.keys(fieldSchema.variants);
	const current = String(effectiveValue ?? fieldSchema.default);

	const onSelect = useCallback(
		(newValue: string) => {
			if (newValue === propStatus.codeValue) {
				return;
			}

			onDragValueChange(newValue);
			onSave(newValue).finally(() => {
				onDragEnd();
			});
		},
		[propStatus, onSave, onDragValueChange, onDragEnd],
	);

	const items = useMemo<ComboboxValue[]>(() => {
		return variantKeys.map((key) => ({
			type: 'item',
			id: key,
			value: key,
			label: key,
			onClick: () => onSelect(key),
			keyHint: null,
			leftItem: null,
			subMenu: null,
			quickSwitcherLabel: null,
			disabled: false,
		}));
	}, [variantKeys, onSelect]);

	return (
		<Combobox
			size="small"
			title={field.key}
			selectedId={current}
			values={items}
			style={comboboxStyle}
		/>
	);
};
