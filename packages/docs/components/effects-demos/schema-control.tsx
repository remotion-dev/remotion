import React, {useMemo} from 'react';
import type {ArrayFieldSchema, InteractivitySchemaField} from 'remotion';
import {getDefaultValueFromSchema} from './get-default-props-from-schema';
import styles from '../demos/styles.module.css';

const left: React.CSSProperties = {
	fontFamily: 'GTPlanar',
	flex: 1,
	flexDirection: 'row',
	display: 'flex',
	alignItems: 'center',
};

const check: React.CSSProperties = {
	marginRight: 4,
};

const right: React.CSSProperties = {
	width: 60,
	textAlign: 'right',
	fontVariantNumeric: 'tabular-nums',
};

const getNumberValue = (
	value: unknown,
	field: Extract<
		InteractivitySchemaField,
		{type: 'number'} | {type: 'rotation-degrees'}
	>,
): number => {
	if (typeof value === 'number') {
		return value;
	}

	return getDefaultValueFromSchema(field) as number;
};

const getDemoNumberRange = (
	fieldKey: string,
	field: Extract<
		InteractivitySchemaField,
		{type: 'number'} | {type: 'rotation-degrees'}
	>,
): {min: number; max: number} | null => {
	if (field.min !== undefined && field.max !== undefined) {
		return {min: field.min, max: field.max};
	}

	if (fieldKey === 'offset') {
		return {min: -400, max: 400};
	}

	return null;
};

const getStringValue = (value: unknown, fallback: unknown): string => {
	if (typeof value === 'string') {
		return value;
	}

	return typeof fallback === 'string' ? fallback : '';
};

const getStringOrNumberValue = (value: unknown, fallback: unknown): string => {
	if (typeof value === 'string' || typeof value === 'number') {
		return String(value);
	}

	if (typeof fallback === 'string' || typeof fallback === 'number') {
		return String(fallback);
	}

	return '';
};

const getUvValue = (
	value: unknown,
	field: Extract<InteractivitySchemaField, {type: 'uv-coordinate'}>,
): readonly [number, number] => {
	if (
		Array.isArray(value) &&
		value.length === 2 &&
		value.every((item) => typeof item === 'number')
	) {
		return [value[0], value[1]] as const;
	}

	return getDefaultValueFromSchema(field) as readonly [number, number];
};

const getArrayValue = (
	value: unknown,
	field: ArrayFieldSchema,
): readonly unknown[] => {
	if (Array.isArray(value)) {
		return value;
	}

	const fallback = getDefaultValueFromSchema(field);
	return Array.isArray(fallback) ? fallback : [];
};

const getArrayItemLabel = (index: number): string => String(index);

const getArrayItemKey = (value: unknown, index: number): string => {
	return `${JSON.stringify(value)}-${index}`;
};

const getArrayItemValue = (
	value: unknown,
	field: ArrayFieldSchema,
): unknown => {
	if (value !== undefined) {
		return value;
	}

	return field.newItemDefault;
};

const isUvCoordinateValue = (
	value: unknown,
): value is readonly [number, number] => {
	return (
		Array.isArray(value) &&
		value.length === 2 &&
		value.every((item) => typeof item === 'number')
	);
};

const makeArrayItemFieldSchema = ({
	field,
	value,
}: {
	readonly field: ArrayFieldSchema;
	readonly value: unknown;
}): InteractivitySchemaField => {
	const defaultValue = getArrayItemValue(value, field);
	const {item} = field;

	if (item.type === 'number') {
		return {
			...item,
			default: typeof defaultValue === 'number' ? defaultValue : undefined,
			hiddenFromList: false,
		};
	}

	if (item.type === 'rotation-degrees') {
		return {
			...item,
			default: typeof defaultValue === 'number' ? defaultValue : undefined,
		};
	}

	if (item.type === 'boolean') {
		return {
			...item,
			default: Boolean(defaultValue),
		};
	}

	if (item.type === 'uv-coordinate') {
		return {
			...item,
			default: isUvCoordinateValue(defaultValue) ? defaultValue : undefined,
		};
	}

	if (
		item.type === 'rotation-css' ||
		item.type === 'translate' ||
		item.type === 'color'
	) {
		return {
			...item,
			default: typeof defaultValue === 'string' ? defaultValue : undefined,
		};
	}

	if (item.type === 'enum') {
		return {
			type: 'enum',
			default:
				typeof defaultValue === 'string'
					? defaultValue
					: (item.variants[0] ?? ''),
			variants: Object.fromEntries(
				item.variants.map((variant) => [variant, {}]),
			),
		};
	}

	throw new Error(
		`Unsupported array item field: ${JSON.stringify(item satisfies never)}`,
	);
};

const SchemaControlInput = ({
	fieldKey,
	field,
	value,
	setValue,
	inputStyle,
	textInputStyle,
}: {
	readonly fieldKey: string;
	readonly field: InteractivitySchemaField;
	readonly value: unknown;
	readonly setValue: (value: unknown) => void;
	readonly inputStyle: React.CSSProperties;
	readonly textInputStyle: React.CSSProperties;
}) => {
	const numberRange =
		field.type === 'number' || field.type === 'rotation-degrees'
			? getDemoNumberRange(fieldKey, field)
			: null;

	if (field.type === 'array') {
		return (
			<div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
				{getArrayValue(value, field).map((itemValue, index, array) => {
					const itemField = makeArrayItemFieldSchema({
						field,
						value: itemValue,
					});
					const updateAtIndex = (nextItemValue: unknown) => {
						setValue(
							array.map((previousItem, itemIndex) =>
								itemIndex === index ? nextItemValue : previousItem,
							),
						);
					};

					const canRemove = array.length > (field.minLength ?? 0);

					return (
						<div
							key={getArrayItemKey(itemValue, index)}
							style={{display: 'flex', alignItems: 'center', gap: 4}}
						>
							<code>{getArrayItemLabel(index)}</code>
							<SchemaControlInput
								field={itemField}
								fieldKey={`${fieldKey}[${index}]`}
								inputStyle={inputStyle}
								setValue={updateAtIndex}
								textInputStyle={textInputStyle}
								value={getArrayItemValue(itemValue, field)}
							/>
							<button
								type="button"
								disabled={!canRemove}
								onClick={() =>
									setValue(
										array.filter((_entry, itemIndex) => itemIndex !== index),
									)
								}
							>
								-
							</button>
						</div>
					);
				})}
				<button
					type="button"
					disabled={
						getArrayValue(value, field).length >= (field.maxLength ?? Infinity)
					}
					onClick={() =>
						setValue([...getArrayValue(value, field), field.newItemDefault])
					}
				>
					Add
				</button>
			</div>
		);
	}

	if (field.type === 'number' || field.type === 'rotation-degrees') {
		return numberRange ? (
			<input
				type="range"
				min={numberRange.min}
				max={numberRange.max}
				step={field.step}
				value={getNumberValue(value, field)}
				style={inputStyle}
				onChange={(e) => setValue(Number(e.target.value))}
			/>
		) : (
			<input
				type="number"
				step={field.step}
				value={getNumberValue(value, field)}
				style={inputStyle}
				onChange={(e) => setValue(Number(e.target.value))}
			/>
		);
	}

	if (field.type === 'uv-coordinate') {
		return (
			<>
				<input
					type="range"
					min={field.min ?? 0}
					max={field.max ?? 1}
					step={field.step ?? 0.01}
					value={getUvValue(value, field)[0]}
					style={inputStyle}
					onChange={(e) =>
						setValue([
							Number(e.target.value),
							getUvValue(value, field)[1],
						] as const)
					}
				/>
				<input
					type="range"
					min={field.min ?? 0}
					max={field.max ?? 1}
					step={field.step ?? 0.01}
					value={getUvValue(value, field)[1]}
					style={inputStyle}
					onChange={(e) =>
						setValue([
							getUvValue(value, field)[0],
							Number(e.target.value),
						] as const)
					}
				/>
			</>
		);
	}

	if (field.type === 'enum') {
		return (
			<div>
				<select
					value={getStringValue(value, field.default)}
					onChange={(e) => {
						setValue(e.target.value);
					}}
				>
					{Object.keys(field.variants).map((variant) => {
						return (
							<option key={variant} value={variant}>
								{variant}
							</option>
						);
					})}
				</select>
			</div>
		);
	}

	if (field.type === 'boolean') {
		return (
			<input
				onChange={(event) => {
					setValue(event.target.checked);
				}}
				style={check}
				checked={value as boolean}
				type="checkbox"
			/>
		);
	}

	if (field.type === 'color') {
		return (
			<input
				type="color"
				onChange={(e) => setValue(e.target.value)}
				value={getStringValue(value, getDefaultValueFromSchema(field))}
			/>
		);
	}

	if (
		field.type === 'rotation-css' ||
		field.type === 'translate' ||
		field.type === 'transform-origin'
	) {
		return (
			<input
				onChange={(e) => setValue(e.target.value)}
				style={textInputStyle}
				value={getStringValue(value, getDefaultValueFromSchema(field))}
			/>
		);
	}

	if (field.type === 'scale') {
		return (
			<input
				onChange={(e) => setValue(e.target.value)}
				style={textInputStyle}
				value={getStringOrNumberValue(value, getDefaultValueFromSchema(field))}
			/>
		);
	}

	if (field.type === 'hidden') {
		return null;
	}

	throw new Error(
		`Unsupported field: ${JSON.stringify(field satisfies never)}`,
	);
};

export const SchemaControl = ({
	fieldKey,
	field,
	value,
	setValue,
}: {
	readonly fieldKey: string;
	readonly field: InteractivitySchemaField;
	readonly value: unknown;
	readonly setValue: (value: unknown) => void;
}) => {
	const labelStyle = useMemo<React.CSSProperties>(
		() => ({
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
		}),
		[],
	);

	const inputStyle = useMemo<React.CSSProperties>(
		() => ({
			width: 80,
			marginRight: 2,
		}),
		[],
	);

	const textInputStyle = useMemo<React.CSSProperties>(
		() => ({
			width: '100%',
			marginRight: 2,
		}),
		[],
	);

	if (field.type === 'hidden') {
		return null;
	}

	const label = field.description ?? fieldKey;

	return (
		<label style={labelStyle} className={styles.item}>
			<div style={left}>{label}</div>
			<SchemaControlInput
				field={field}
				fieldKey={fieldKey}
				inputStyle={inputStyle}
				setValue={setValue}
				textInputStyle={textInputStyle}
				value={value}
			/>
			{field.type === 'array' ? null : field.type === 'number' ||
			  field.type === 'rotation-degrees' ? (
				<div style={right}>
					<code>{getNumberValue(value, field)}</code>
				</div>
			) : field.type === 'uv-coordinate' ? (
				<div style={right}>
					<code>{`[${getUvValue(value, field)[0]}, ${getUvValue(value, field)[1]}]`}</code>
				</div>
			) : null}
		</label>
	);
};
