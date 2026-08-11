import React, {useMemo} from 'react';
import type {Option} from './types';
import styles from './styles.module.css';

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
	width: 45,
	textAlign: 'right',
	fontVariantNumeric: 'tabular-nums',
};

export const Control = ({
	option,
	value,
	setValue,
}: {
	readonly option: Option;
	readonly value: number | string | boolean | readonly [number, number];
	readonly setValue: (
		value: number | string | boolean | readonly [number, number] | null,
	) => void;
}) => {
	const enabled = value !== null;

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

	const uvValue = useMemo<readonly [number, number] | null>(() => {
		if (option.type !== 'uv-coordinate') {
			return null;
		}

		if (
			Array.isArray(value) &&
			value.length === 2 &&
			value.every((item) => typeof item === 'number')
		) {
			return [value[0], value[1]];
		}

		return option.default;
	}, [option, value]);

	return (
		<label style={labelStyle} className={styles.item}>
			<div style={left}>
				{option.optional === 'no' ? null : (
					<input
						onChange={(c) => {
							if (c.target.checked) {
								setValue(option.default);
							} else {
								setValue(null);
							}
						}}
						style={check}
						checked={enabled}
						type={'checkbox'}
					/>
				)}
				{`${option.name}`}
			</div>
			{option.type === 'numeric' && enabled ? (
				<input
					type="range"
					min={option.min}
					max={option.max}
					step={option.step}
					value={value as number}
					style={inputStyle}
					onChange={(e) => setValue(Number(e.target.value))}
				/>
			) : option.type === 'uv-coordinate' && enabled ? (
				<>
					<input
						type="range"
						min={option.min}
						max={option.max}
						step={option.step}
						value={(uvValue ?? option.default)[0]}
						style={inputStyle}
						onChange={(e) =>
							setValue([
								Number(e.target.value),
								(uvValue ?? option.default)[1],
							] as const)
						}
					/>
					<input
						type="range"
						min={option.min}
						max={option.max}
						step={option.step}
						value={(uvValue ?? option.default)[1]}
						style={inputStyle}
						onChange={(e) =>
							setValue([
								(uvValue ?? option.default)[0],
								Number(e.target.value),
							] as const)
						}
					/>
				</>
			) : null}
			{option.type === 'numeric' ? (
				<div style={right}>
					<code>{value}</code>
				</div>
			) : option.type === 'uv-coordinate' ? (
				<div style={right}>
					<code>{`[${(uvValue ?? option.default)[0]}, ${(uvValue ?? option.default)[1]}]`}</code>
				</div>
			) : option.type === 'enum' ? (
				<div>
					<select
						value={typeof value === 'string' ? value : option.default}
						onChange={(e) => {
							setValue(e.target.value);
						}}
					>
						{option.values.map((v) => {
							return (
								<option key={v} value={v}>
									{v}
								</option>
							);
						})}
					</select>
				</div>
			) : option.type === 'boolean' ? (
				<input
					onChange={(c) => {
						setValue(c.target.checked);
					}}
					style={check}
					checked={value as boolean}
					type={'checkbox'}
				/>
			) : option.type === 'string' ? (
				<input
					onChange={(e) => setValue(e.target.value)}
					style={textInputStyle}
					value={value as string}
				/>
			) : option.type === 'color' ? (
				<input
					type="color"
					onChange={(e) => setValue(e.target.value)}
					value={value as string}
				/>
			) : null}
		</label>
	);
};
