import {opacify} from 'polished';
import type {ButtonHTMLAttributes, DetailedHTMLProps} from 'react';
import React from 'react';
import styles from './button.module.css';
import {RED, UNDERLAY_RED} from './colors';

type ExtraProps = {
	readonly size: Size;
	readonly fullWidth: boolean;
	readonly background: string;
	readonly hoverColor?: string;
	readonly color: string;
	readonly loading: boolean;
};

type Size = 'sm' | 'bg';

type Props = DetailedHTMLProps<
	ButtonHTMLAttributes<HTMLButtonElement>,
	HTMLButtonElement
> &
	ExtraProps;
type MandatoryProps = Omit<ExtraProps, 'background' | 'color' | 'hoverColor'>;
type PrestyledProps = DetailedHTMLProps<
	ButtonHTMLAttributes<HTMLButtonElement>,
	HTMLButtonElement
> &
	MandatoryProps;

export const Button: React.FC<Props> = (props) => {
	const {children, loading, hoverColor, fullWidth, color, size, ...other} =
		props;
	const actualDisabled = other.disabled || loading;

	return (
		<button
			type="button"
			className={styles.buttoncontainer}
			disabled={actualDisabled}
			{...other}
			style={{
				...(props.style ?? {}),
				padding:
					props.style?.padding ??
					(props.size === 'sm' ? '10px 16px' : '16px 22px'),
				color: props.color,
				cursor: props.disabled ? 'default' : 'pointer',
				backgroundColor: props.background,
				// @ts-expect-error
				'--hover-color': props.hoverColor ?? props.background,
				...(props.fullWidth ? {width: '100%'} : {}),
				opacity: props.disabled ? 0.7 : 1,
			}}
		>
			{children}
		</button>
	);
};

export const BlueButton: React.FC<PrestyledProps> = (props) => {
	return <Button {...props} background="var(--blue-underlay)" color="white" />;
};

export const PlainButton: React.FC<PrestyledProps> = (props) => {
	return (
		<Button
			{...props}
			background="var(--plain-button)"
			color="var(--text-color)"
		/>
	);
};

export const RedButton: React.FC<PrestyledProps> = (props) => {
	return (
		<Button
			{...props}
			background={UNDERLAY_RED}
			hoverColor={opacify(0.1, UNDERLAY_RED)}
			color={RED}
		/>
	);
};

export const ClearButton: React.FC<PrestyledProps> = (props) => {
	return (
		<Button
			{...props}
			background="transparent"
			color="var(--text-color)"
			hoverColor="var(--clear-hover)"
		/>
	);
};
