import {opacify} from 'polished';
import type {ButtonHTMLAttributes, DetailedHTMLProps} from 'react';
import React from 'react';
import {RED, UNDERLAY_RED} from './colors';
import styles from './button.module.css';

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
	const {
		children,
		loading,
		hoverColor,
		fullWidth,
		color,
		size,
		className,
		disabled,
		...other
	} = props;
	const actualDisabled = disabled || loading;

	return (
		<button
			type="button"
			className={
				className
					? `${styles.buttoncontainer} ${className}`
					: styles.buttoncontainer
			}
			disabled={actualDisabled}
			{...other}
			aria-busy={loading}
			style={{
				...(props.style ?? {}),
				padding:
					props.style?.padding ??
					(props.size === 'sm' ? '10px 16px' : '16px 22px'),
				color: props.color,
				cursor: actualDisabled ? 'default' : (props.style?.cursor ?? 'pointer'),
				backgroundColor: props.background,
				// @ts-expect-error
				'--hover-color': props.hoverColor ?? props.background,
				...(props.fullWidth ? {width: '100%'} : {}),
				opacity: disabled ? 0.7 : 1,
			}}
		>
			<span
				className={`${styles.buttonContent} ${loading ? styles.buttonContentLoading : ''}`}
			>
				{children}
			</span>
			{loading ? (
				<span aria-hidden="true" className={styles.spinnerOverlay}>
					<svg
						className={styles.spinner}
						focusable="false"
						viewBox="0 0 100 100"
					>
						{[0, 45, 90, 135, 180, 225, 270, 315].map((rotation) => (
							<path
								key={rotation}
								d="M 44 0 L 50 0 a 6 6 0 0 1 6 6 L 56 26 a 6 6 0 0 1 -6 6 L 50 32 a 6 6 0 0 1 -6 -6 L 44 6 a 6 6 0 0 1 6 -6 Z"
								fill="currentColor"
								transform={`rotate(${rotation} 50 50)`}
							>
								<animate
									attributeName="opacity"
									begin={`${rotation / 360}s`}
									dur="1s"
									from="1"
									repeatCount="indefinite"
									to="0.15"
								/>
							</path>
						))}
					</svg>
				</span>
			) : null}
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
