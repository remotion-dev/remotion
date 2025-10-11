import {opacify} from 'polished';
import type {ButtonHTMLAttributes, DetailedHTMLProps} from 'react';
import React from 'react';
import {cn} from '../../../cn';
import {RED, UNDERLAY_RED} from './colors';

type ExtraProps = {
	readonly size: Size;
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
	const {children, loading, hoverColor, color, size, className, ...other} =
		props;
	const actualDisabled = other.disabled || loading;

	return (
		<button
			type="button"
			className={cn(
				'text-base rounded-lg font-bold appearance-none border-2 border-solid border-black border-b-4 font-sans flex flex-row items-center justify-center ',
				className,
			)}
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
