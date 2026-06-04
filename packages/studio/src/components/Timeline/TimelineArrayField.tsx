import React, {useCallback, useMemo} from 'react';
import type {
	ArrayFieldSchema,
	CanUpdateSequencePropStatusStatic,
	SequencePropsSubscriptionKey,
	VisibleFieldSchema,
} from 'remotion';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {TimelineBooleanField} from './TimelineBooleanField';
import {TimelineColorField} from './TimelineColorField';
import {TimelineEnumField} from './TimelineEnumField';
import {TimelineNumberField} from './TimelineNumberField';
import {TimelineRotationField} from './TimelineRotationField';
import {TimelineScaleField} from './TimelineScaleField';
import {TimelineTranslateField} from './TimelineTranslateField';
import {TimelineUvCoordinateField} from './TimelineUvCoordinateField';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-start',
	minWidth: 0,
};

const itemContainer: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 6,
	flexShrink: 0,
	height: 22,
	minWidth: 0,
};

const itemLabel: React.CSSProperties = {
	color: 'rgba(255, 255, 255, 0.45)',
	fontSize: 11,
	fontVariantNumeric: 'tabular-nums',
	width: 18,
	textAlign: 'right',
};

const button: React.CSSProperties = {
	background: 'rgba(255, 255, 255, 0.08)',
	border: '1px solid rgba(255, 255, 255, 0.12)',
	borderRadius: 3,
	color: 'white',
	cursor: 'pointer',
	fontSize: 10,
	height: 18,
	lineHeight: '16px',
	padding: '0 5px',
};

const disabledButton: React.CSSProperties = {
	...button,
	cursor: 'default',
	opacity: 0.4,
};

const addButtonRow: React.CSSProperties = {
	...itemContainer,
	paddingLeft: 24,
};

const getFallbackItemValue = (field: ArrayFieldSchema): unknown => {
	if (field.newItemDefault !== undefined) {
		return field.newItemDefault;
	}

	if (field.item.type === 'number' || field.item.type === 'rotation-degrees') {
		return field.item.min ?? 0;
	}

	if (field.item.type === 'boolean') {
		return false;
	}

	if (field.item.type === 'rotation-css') {
		return '0deg';
	}

	if (field.item.type === 'translate') {
		return '0px 0px';
	}

	if (field.item.type === 'scale') {
		return 1;
	}

	if (field.item.type === 'uv-coordinate') {
		return [0.5, 0.5] as const;
	}

	if (field.item.type === 'color') {
		return '#000000';
	}

	const [firstVariant] = field.item.variants;
	return firstVariant;
};

const isUvCoordinateDefault = (
	value: unknown,
): value is readonly [number, number] => {
	return (
		Array.isArray(value) &&
		value.length === 2 &&
		value.every((item) => typeof item === 'number')
	);
};

const makeItemFieldSchema = ({
	field,
	defaultValue,
}: {
	field: ArrayFieldSchema;
	defaultValue: unknown;
}): VisibleFieldSchema => {
	if (field.item.type === 'number') {
		return {
			...field.item,
			default: typeof defaultValue === 'number' ? defaultValue : undefined,
			hiddenFromList: false,
		};
	}

	if (field.item.type === 'boolean') {
		return {
			...field.item,
			default: Boolean(defaultValue),
		};
	}

	if (field.item.type === 'rotation-css') {
		return {
			...field.item,
			default: typeof defaultValue === 'string' ? defaultValue : undefined,
		};
	}

	if (field.item.type === 'rotation-degrees') {
		return {
			...field.item,
			default: typeof defaultValue === 'number' ? defaultValue : undefined,
		};
	}

	if (field.item.type === 'translate') {
		return {
			...field.item,
			default: typeof defaultValue === 'string' ? defaultValue : undefined,
		};
	}

	if (field.item.type === 'scale') {
		return {
			...field.item,
			default:
				typeof defaultValue === 'number' || typeof defaultValue === 'string'
					? defaultValue
					: undefined,
		};
	}

	if (field.item.type === 'uv-coordinate') {
		return {
			...field.item,
			default: isUvCoordinateDefault(defaultValue) ? defaultValue : undefined,
		};
	}

	if (field.item.type === 'color') {
		return {
			...field.item,
			default: typeof defaultValue === 'string' ? defaultValue : undefined,
		};
	}

	return {
		type: 'enum',
		default:
			typeof defaultValue === 'string'
				? defaultValue
				: (field.item.variants[0] ?? ''),
		variants: Object.fromEntries(
			field.item.variants.map((variant) => [variant, {}]),
		),
	};
};

const replaceAtIndex = (
	items: readonly unknown[],
	index: number,
	value: unknown,
): unknown[] => items.map((item, i) => (i === index ? value : item));

const ItemEditor: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly arrayField: ArrayFieldSchema;
	readonly items: readonly unknown[];
	readonly index: number;
	readonly onSave: TimelineFieldOnSave;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: () => void;
	readonly scaleLockNodePath: SequencePropsSubscriptionKey | null;
}> = ({
	field,
	arrayField,
	items,
	index,
	onSave,
	onDragValueChange,
	onDragEnd,
	scaleLockNodePath,
}) => {
	const fallback = useMemo(
		() => getFallbackItemValue(arrayField),
		[arrayField],
	);
	const value = items[index] ?? fallback;
	const itemField = useMemo<SchemaFieldInfo>(() => {
		const fieldSchema = makeItemFieldSchema({
			field: arrayField,
			defaultValue: fallback,
		});

		return {
			...field,
			key: `${field.key}[${index}]`,
			typeName: fieldSchema.type,
			fieldSchema,
		};
	}, [arrayField, fallback, field, index]);

	const propStatus = useMemo<CanUpdateSequencePropStatusStatic>(
		() => ({
			status: 'static',
			codeValue: value,
		}),
		[value],
	);

	const onSaveItem = useCallback(
		(next: unknown) => onSave(replaceAtIndex(items, index, next)),
		[index, items, onSave],
	);

	const onDragItem = useCallback(
		(next: unknown) => onDragValueChange(replaceAtIndex(items, index, next)),
		[index, items, onDragValueChange],
	);

	if (itemField.typeName === 'number') {
		return (
			<TimelineNumberField
				field={itemField}
				effectiveValue={value}
				propStatus={propStatus}
				onSave={onSaveItem}
				onDragValueChange={onDragItem}
				onDragEnd={onDragEnd}
			/>
		);
	}

	if (
		itemField.typeName === 'rotation-css' ||
		itemField.typeName === 'rotation-degrees'
	) {
		return (
			<TimelineRotationField
				field={itemField}
				effectiveValue={value}
				propStatus={propStatus}
				onSave={onSaveItem}
				onDragValueChange={onDragItem}
				onDragEnd={onDragEnd}
			/>
		);
	}

	if (itemField.typeName === 'translate') {
		return (
			<TimelineTranslateField
				field={itemField}
				effectiveValue={value}
				propStatus={propStatus}
				onSave={onSaveItem}
				onDragValueChange={onDragItem}
				onDragEnd={onDragEnd}
			/>
		);
	}

	if (itemField.typeName === 'scale') {
		return (
			<TimelineScaleField
				field={itemField}
				effectiveValue={value}
				propStatus={propStatus}
				onSave={onSaveItem}
				onDragValueChange={onDragItem}
				onDragEnd={onDragEnd}
				scaleLockNodePath={scaleLockNodePath}
			/>
		);
	}

	if (itemField.typeName === 'uv-coordinate') {
		return (
			<TimelineUvCoordinateField
				field={itemField}
				effectiveValue={value}
				propStatus={propStatus}
				onSave={onSaveItem}
				onDragValueChange={onDragItem}
				onDragEnd={onDragEnd}
			/>
		);
	}

	if (itemField.typeName === 'boolean') {
		return (
			<TimelineBooleanField
				field={itemField}
				effectiveValue={value}
				propStatus={propStatus}
				onSave={onSaveItem}
			/>
		);
	}

	if (itemField.typeName === 'color') {
		return (
			<TimelineColorField
				field={itemField}
				effectiveValue={value}
				propStatus={propStatus}
				onSave={onSaveItem}
				onDragValueChange={onDragItem}
				onDragEnd={onDragEnd}
			/>
		);
	}

	return (
		<TimelineEnumField
			field={itemField}
			effectiveValue={value}
			propStatus={propStatus}
			onSave={onSaveItem}
			onDragValueChange={onDragItem}
			onDragEnd={onDragEnd}
		/>
	);
};

export const TimelineArrayField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly effectiveValue: unknown;
	readonly onSave: TimelineFieldOnSave;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: () => void;
	readonly scaleLockNodePath: SequencePropsSubscriptionKey | null;
}> = ({
	field,
	effectiveValue,
	onSave,
	onDragValueChange,
	onDragEnd,
	scaleLockNodePath,
}) => {
	const arrayField = field.fieldSchema;
	if (arrayField.type !== 'array') {
		throw new Error('TimelineArrayField rendered for non-array field');
	}

	const items = useMemo<readonly unknown[]>(() => {
		if (Array.isArray(effectiveValue)) {
			return effectiveValue;
		}

		return Array.isArray(arrayField.default) ? arrayField.default : [];
	}, [arrayField.default, effectiveValue]);

	const minLength = arrayField.minLength ?? 0;
	const maxLength = arrayField.maxLength ?? Infinity;
	const canAdd = items.length < maxLength;
	const canRemove = items.length > minLength;

	const onAdd = useCallback(() => {
		if (!canAdd) {
			return;
		}

		onSave([...items, getFallbackItemValue(arrayField)]);
	}, [arrayField, canAdd, items, onSave]);

	const onRemove = useCallback(
		(index: number) => {
			if (!canRemove) {
				return;
			}

			onSave(items.filter((_item, i) => i !== index));
		},
		[canRemove, items, onSave],
	);

	return (
		<span style={container}>
			{items.map((_item, index) => (
				<span style={itemContainer} key={index}>
					<span style={itemLabel}>{index + 1}</span>
					<ItemEditor
						field={field}
						arrayField={arrayField}
						items={items}
						index={index}
						onSave={onSave}
						onDragValueChange={onDragValueChange}
						onDragEnd={onDragEnd}
						scaleLockNodePath={scaleLockNodePath}
					/>
					<button
						type="button"
						style={canRemove ? button : disabledButton}
						disabled={!canRemove}
						onClick={() => onRemove(index)}
						title={`Remove item ${index + 1}`}
					>
						-
					</button>
				</span>
			))}
			{canAdd ? (
				<span style={addButtonRow}>
					<button type="button" style={button} onClick={onAdd} title="Add item">
						+
					</button>
				</span>
			) : null}
		</span>
	);
};
