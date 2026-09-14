import React, {useCallback, useMemo} from 'react';
import type {CanUpdateSequencePropStatusStatic} from 'remotion';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import {RemotionInput} from '../NewComposition/RemInput';
import {draggerStyle} from './timeline-field-utils';
import {TimelineNumberField} from './TimelineNumberField';

const FONT_WEIGHT_KEYWORDS = ['normal', 'bold', 'bolder', 'lighter'] as const;

export const TimelineFontWeightField: React.FC<{
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
	if (fieldSchema.type !== 'font-weight') {
		throw new Error(
			'TimelineFontWeightField rendered for non-font-weight field',
		);
	}

	const sourceValue = propStatus.codeValue ?? fieldSchema.default;
	const currentValue = effectiveValue ?? sourceValue;

	const onSelectKeyword = useCallback(
		(newValue: string) => {
			if (newValue === propStatus.codeValue) {
				return;
			}

			onDragValueChange(newValue);
			onSave(newValue).finally(onDragEnd);
		},
		[onDragEnd, onDragValueChange, onSave, propStatus.codeValue],
	);

	const keywordItems = useMemo<ComboboxValue[]>(() => {
		return FONT_WEIGHT_KEYWORDS.map((keyword) => ({
			type: 'item',
			id: keyword,
			value: keyword,
			label: keyword,
			onClick: () => onSelectKeyword(keyword),
			keyHint: null,
			leftItem: null,
			subMenu: null,
			quickSwitcherLabel: null,
			disabled: false,
		}));
	}, [onSelectKeyword]);

	if (typeof sourceValue === 'number') {
		return (
			<TimelineNumberField
				effectiveValue={currentValue}
				field={field}
				onDragEnd={onDragEnd}
				onDragValueChange={onDragValueChange}
				onSave={onSave}
				propStatus={propStatus}
			/>
		);
	}

	if (
		FONT_WEIGHT_KEYWORDS.includes(
			sourceValue as (typeof FONT_WEIGHT_KEYWORDS)[number],
		)
	) {
		return (
			<Combobox
				size="small"
				title={field.key}
				selectedId={String(currentValue)}
				values={keywordItems}
			/>
		);
	}

	return (
		<RemotionInput
			key={String(sourceValue)}
			status="ok"
			rightAlign={false}
			small
			defaultValue={String(currentValue ?? '')}
			onBlur={(event) => {
				const newValue = event.currentTarget.value;
				if (newValue === propStatus.codeValue) {
					onDragEnd();
					return;
				}

				onSave(newValue).finally(onDragEnd);
			}}
			onChange={(event) => onDragValueChange(event.currentTarget.value)}
			onDoubleClick={(event) => event.stopPropagation()}
			onKeyDown={(event) => {
				if (event.key === 'Enter') {
					event.currentTarget.blur();
				}

				if (event.key === 'Escape') {
					event.currentTarget.value = String(propStatus.codeValue ?? '');
					onDragEnd();
					event.currentTarget.blur();
				}
			}}
			style={{...draggerStyle, boxSizing: 'border-box'}}
		/>
	);
};
