import React, {useCallback, useMemo} from 'react';
import type {SchemaFieldInfo} from '../../helpers/timeline-layout';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';

const comboboxStyle: React.CSSProperties = {
	marginLeft: 8,
};

export const TimelineEnumField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly codeValue: unknown;
	readonly effectiveValue: unknown;
	readonly canUpdate: boolean;
	readonly onSave: (value: unknown) => Promise<void>;
	readonly onDragValueChange: (value: unknown) => void;
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
	const {fieldSchema} = field;
	if (fieldSchema.type !== 'enum') {
		throw new Error('TimelineEnumField rendered for non-enum field');
	}

	const variantKeys = Object.keys(fieldSchema.variants);
	const current = String(effectiveValue ?? fieldSchema.default);

	const onSelect = useCallback(
		(newValue: string) => {
			if (!canUpdate || newValue === codeValue) {
				return;
			}

			onDragValueChange(newValue);
			onSave(newValue).finally(() => {
				onDragEnd();
			});
		},
		[canUpdate, codeValue, onSave, onDragValueChange, onDragEnd],
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
			disabled: !canUpdate,
		}));
	}, [variantKeys, onSelect, canUpdate]);

	return (
		<Combobox
			small
			title={field.key}
			selectedId={current}
			values={items}
			style={comboboxStyle}
		/>
	);
};
