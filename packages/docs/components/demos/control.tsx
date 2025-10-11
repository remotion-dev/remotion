import React, {useMemo} from 'react';
import styles from './styles.module.css';
import type {Option} from './types';

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
	readonly value: number | string | boolean;
	readonly setValue: (value: number | string | boolean | null) => void;
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
			) : null}
			{option.type === 'numeric' ? (
				<div style={right}>
					<code>{value}</code>
				</div>
			) : option.type === 'enum' ? (
				<div>
					<select
						onChange={(e) => {
							setValue(e.target.value);
						}}
					>
						{option.values.map((v) => {
							return (
								<option key={v} selected={value === v}>
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
			) : null}
		</label>
	);
};
