import React, {useCallback, useMemo, useRef} from 'react';
import type {
	ArrayFieldSchema,
	CanUpdateSequencePropStatusStatic,
} from 'remotion';
import {
	BLACK_FULL_HEX,
	BORDER_WHITE_ALPHA_12,
	WHITE,
	WHITE_ALPHA_08,
	WHITE_ALPHA_45,
} from '../../helpers/colors';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {
	TimelinePrimitiveFieldValue,
	type TimelinePrimitiveFieldInfo,
} from './TimelinePrimitiveFieldValue';

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
	color: WHITE_ALPHA_45,
	fontSize: 11,
	fontVariantNumeric: 'tabular-nums',
	width: 18,
	textAlign: 'right',
};

const button: React.CSSProperties = {
	background: WHITE_ALPHA_08,
	border: BORDER_WHITE_ALPHA_12,
	borderRadius: 3,
	color: WHITE,
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

	if (field.item.type === 'uv-coordinate') {
		return [0.5, 0.5] as const;
	}

	if (field.item.type === 'color') {
		return BLACK_FULL_HEX;
	}

	if (field.item.type === 'enum') {
		const [firstVariant] = field.item.variants;
		return firstVariant;
	}

	throw new Error(
		`Unsupported array item field: ${JSON.stringify(field.item satisfies never)}`,
	);
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
}): TimelinePrimitiveFieldInfo['fieldSchema'] => {
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

	if (field.item.type === 'enum') {
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
	}

	throw new Error(
		`Unsupported array item field: ${JSON.stringify(field.item satisfies never)}`,
	);
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
}> = ({
	field,
	arrayField,
	items,
	index,
	onSave,
	onDragValueChange,
	onDragEnd,
}) => {
	const fallback = useMemo(
		() => getFallbackItemValue(arrayField),
		[arrayField],
	);
	const value = items[index] ?? fallback;
	const itemField = useMemo<TimelinePrimitiveFieldInfo>(() => {
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

	return (
		<TimelinePrimitiveFieldValue
			effectiveValue={value}
			field={itemField}
			onDragEnd={onDragEnd}
			onDragValueChange={onDragItem}
			onSave={onSaveItem}
			propStatus={propStatus}
			scaleLockNodePath={null}
		/>
	);
};

export const TimelineArrayField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly effectiveValue: unknown;
	readonly onSave: TimelineFieldOnSave;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: () => void;
}> = ({field, effectiveValue, onSave, onDragValueChange, onDragEnd}) => {
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
	const itemKeys = useRef<string[]>([]);
	const nextItemKey = useRef(0);

	while (itemKeys.current.length < items.length) {
		itemKeys.current.push(`${field.key}-${nextItemKey.current}`);
		nextItemKey.current++;
	}

	if (itemKeys.current.length > items.length) {
		itemKeys.current.length = items.length;
	}

	const onAdd = useCallback(() => {
		if (!canAdd) {
			return;
		}

		itemKeys.current.push(`${field.key}-${nextItemKey.current}`);
		nextItemKey.current++;
		onSave([...items, getFallbackItemValue(arrayField)]);
	}, [arrayField, canAdd, field.key, items, onSave]);

	const onRemove = useCallback(
		(index: number) => {
			if (!canRemove) {
				return;
			}

			itemKeys.current.splice(index, 1);
			onSave(items.filter((_item, i) => i !== index));
		},
		[canRemove, items, onSave],
	);

	return (
		<span style={container}>
			{items.map((_item, index) => {
				const itemKey = itemKeys.current[index];

				return (
					<span key={itemKey} style={itemContainer}>
						<span style={itemLabel}>{index}</span>
						<ItemEditor
							arrayField={arrayField}
							field={field}
							index={index}
							items={items}
							onDragEnd={onDragEnd}
							onDragValueChange={onDragValueChange}
							onSave={onSave}
						/>
						<button
							disabled={!canRemove}
							onClick={() => onRemove(index)}
							style={canRemove ? button : disabledButton}
							title={`Remove item ${index}`}
							type="button"
						>
							-
						</button>
					</span>
				);
			})}
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
