import React, {useMemo} from 'react';
import type {ArrayFieldSchema, SequenceFieldSchema} from 'remotion';
import styles from '../demos/styles.module.css';
import {getDefaultValueFromSchema} from './get-default-props-from-schema';

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
		SequenceFieldSchema,
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
		SequenceFieldSchema,
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

const getUvValue = (
	value: unknown,
	field: Extract<SequenceFieldSchema, {type: 'uv-coordinate'}>,
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

const getArrayItemLabel = (index: number): string => String(index + 1);

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

const renderArrayItemInput = ({
	field,
	value,
	setValue,
	inputStyle,
	textInputStyle,
}: {
	readonly field: ArrayFieldSchema;
	readonly value: unknown;
	readonly setValue: (value: unknown) => void;
	readonly inputStyle: React.CSSProperties;
	readonly textInputStyle: React.CSSProperties;
}) => {
	const itemValue = getArrayItemValue(value, field);
	const {item} = field;

	if (item.type === 'number' || item.type === 'rotation-degrees') {
		return (
			<input
				type="number"
				min={item.min}
				max={item.max}
				step={item.step}
				value={typeof itemValue === 'number' ? itemValue : (item.min ?? 0)}
				style={inputStyle}
				onChange={(e) => setValue(Number(e.target.value))}
			/>
		);
	}

	if (item.type === 'uv-coordinate') {
		const uv =
			Array.isArray(itemValue) &&
			itemValue.length === 2 &&
			itemValue.every((entry) => typeof entry === 'number')
				? ([itemValue[0], itemValue[1]] as const)
				: ([0.5, 0.5] as const);

		return (
			<>
				<input
					type="range"
					min={item.min ?? 0}
					max={item.max ?? 1}
					step={item.step ?? 0.01}
					value={uv[0]}
					style={inputStyle}
					onChange={(e) => setValue([Number(e.target.value), uv[1]])}
				/>
				<input
					type="range"
					min={item.min ?? 0}
					max={item.max ?? 1}
					step={item.step ?? 0.01}
					value={uv[1]}
					style={inputStyle}
					onChange={(e) => setValue([uv[0], Number(e.target.value)])}
				/>
			</>
		);
	}

	if (item.type === 'boolean') {
		return (
			<input
				type="checkbox"
				checked={Boolean(itemValue)}
				onChange={(e) => setValue(e.target.checked)}
			/>
		);
	}

	if (item.type === 'color') {
		return (
			<input
				type="color"
				value={typeof itemValue === 'string' ? itemValue : '#000000'}
				onChange={(e) => setValue(e.target.value)}
			/>
		);
	}

	if (item.type === 'enum') {
		return (
			<select
				value={
					typeof itemValue === 'string' ? itemValue : (item.variants[0] ?? '')
				}
				onChange={(e) => setValue(e.target.value)}
			>
				{item.variants.map((variant) => (
					<option key={variant} value={variant}>
						{variant}
					</option>
				))}
			</select>
		);
	}

	return (
		<input
			onChange={(e) => setValue(e.target.value)}
			style={textInputStyle}
			value={typeof itemValue === 'string' ? itemValue : String(itemValue ?? '')}
		/>
	);
};

export const SchemaControl = ({
	fieldKey,
	field,
	value,
	setValue,
}: {
	readonly fieldKey: string;
	readonly field: SequenceFieldSchema;
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
	const numberRange =
		field.type === 'number' || field.type === 'rotation-degrees'
			? getDemoNumberRange(fieldKey, field)
			: null;

	return (
		<label style={labelStyle} className={styles.item}>
			<div style={left}>{label}</div>
			{field.type === 'array' ? (
				<div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
					{getArrayValue(value, field).map((itemValue, index, array) => {
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
								{renderArrayItemInput({
									field,
									value: itemValue,
									setValue: updateAtIndex,
									inputStyle,
									textInputStyle,
								})}
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
							getArrayValue(value, field).length >=
							(field.maxLength ?? Infinity)
						}
						onClick={() =>
							setValue([...getArrayValue(value, field), field.newItemDefault])
						}
					>
						Add
					</button>
				</div>
			) : field.type === 'number' || field.type === 'rotation-degrees' ? (
				numberRange ? (
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
				)
			) : field.type === 'uv-coordinate' ? (
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
			) : null}
			{field.type === 'number' || field.type === 'rotation-degrees' ? (
				<div style={right}>
					<code>{getNumberValue(value, field)}</code>
				</div>
			) : field.type === 'uv-coordinate' ? (
				<div style={right}>
					<code>{`[${getUvValue(value, field)[0]}, ${getUvValue(value, field)[1]}]`}</code>
				</div>
			) : field.type === 'enum' ? (
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
			) : field.type === 'boolean' ? (
				<input
					onChange={(event) => {
						setValue(event.target.checked);
					}}
					style={check}
					checked={value as boolean}
					type="checkbox"
				/>
			) : field.type === 'color' ? (
				<input
					type="color"
					onChange={(e) => setValue(e.target.value)}
					value={getStringValue(value, getDefaultValueFromSchema(field))}
				/>
			) : field.type === 'rotation-css' || field.type === 'translate' ? (
				<input
					onChange={(e) => setValue(e.target.value)}
					style={textInputStyle}
					value={getStringValue(value, getDefaultValueFromSchema(field))}
				/>
			) : null}
		</label>
	);
};
