import React, {useMemo} from 'react';
import type {SequenceFieldSchema} from 'remotion';
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
	field: Extract<SequenceFieldSchema, {type: 'number'}>,
): number => {
	if (typeof value === 'number') {
		return value;
	}

	return getDefaultValueFromSchema(field) as number;
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

	return (
		<label style={labelStyle} className={styles.item}>
			<div style={left}>{label}</div>
			{field.type === 'number' ? (
				field.min === undefined || field.max === undefined ? (
					<input
						type="number"
						step={field.step}
						value={getNumberValue(value, field)}
						style={inputStyle}
						onChange={(e) => setValue(Number(e.target.value))}
					/>
				) : (
					<input
						type="range"
						min={field.min}
						max={field.max}
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
			{field.type === 'number' ? (
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
			) : field.type === 'rotation' || field.type === 'translate' ? (
				<input
					onChange={(e) => setValue(e.target.value)}
					style={textInputStyle}
					value={getStringValue(value, getDefaultValueFromSchema(field))}
				/>
			) : null}
		</label>
	);
};
