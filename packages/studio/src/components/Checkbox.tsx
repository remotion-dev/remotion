import React, {useMemo} from 'react';
import {
	INPUT_BACKGROUND,
	BLACK_ALPHA_60,
	TRANSPARENT,
	WHITE,
} from '../helpers/colors';
import {Checkmark} from '../icons/Checkmark';

const SIZES = {
	default: 20,
	small: 18,
} as const;

const CHECKMARK_SIZES = {
	default: 14,
	small: 13,
} as const;

export type CheckboxVariant = keyof typeof SIZES;

export const Checkbox: React.FC<{
	readonly checked: boolean;
	readonly onChange: React.ChangeEventHandler<HTMLInputElement>;
	readonly name: string;
	readonly disabled?: boolean;
	readonly variant?: CheckboxVariant;
}> = ({checked, onChange, disabled, name, variant = 'default'}) => {
	const size = SIZES[variant];
	const checkmarkSize = CHECKMARK_SIZES[variant];

	const background: React.CSSProperties = useMemo(
		() => ({
			height: size,
			width: size,
			position: 'relative',
		}),
		[size],
	);

	const box: React.CSSProperties = useMemo(
		() => ({
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			position: 'absolute',
			height: size,
			width: size,
			top: 0,
			left: 0,
			pointerEvents: 'none',
			color: WHITE,
		}),
		[size],
	);

	const input: React.CSSProperties = useMemo(() => {
		return {
			appearance: 'none',
			background: disabled ? TRANSPARENT : INPUT_BACKGROUND,
			border: '1px solid ' + BLACK_ALPHA_60,
			height: size,
			width: size,
			top: 0,
			left: 0,
			position: 'absolute',
			margin: 0,
		};
	}, [disabled, size]);

	return (
		<div style={background}>
			<input
				style={input}
				type={'checkbox'}
				checked={checked}
				onChange={onChange}
				disabled={disabled}
				name={name}
			/>
			<div style={box}>
				{checked ? <Checkmark size={checkmarkSize} /> : null}
			</div>
		</div>
	);
};
