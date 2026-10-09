import React from 'react';
import {CURRENT_COLOR} from '../helpers/colors';

const iconStyle: React.CSSProperties = {
	width: 10,
	display: 'inline',
};

const shiftIconStyle: React.CSSProperties = {
	display: 'inline-block',
	height: 12,
	verticalAlign: 'baseline',
	width: 12,
};

export const ShiftIcon: React.FC<{
	readonly color: string | null;
}> = ({color}) => {
	return (
		<svg
			aria-hidden="true"
			focusable="false"
			style={shiftIconStyle}
			viewBox="0 0 12 12"
		>
			<path
				d="M4.5 11.5V8.5H1.5L6 3.5L10.5 8.5H7.5V11.5"
				fill="none"
				stroke={color ?? CURRENT_COLOR}
				strokeLinecap="square"
				strokeLinejoin="miter"
				strokeWidth="1"
			/>
		</svg>
	);
};

export const ArrowLeft: React.FC = () => {
	return (
		<svg style={iconStyle} viewBox="0 0 448 512">
			<path
				fill={CURRENT_COLOR}
				d="M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z"
			/>
		</svg>
	);
};

export const ArrowRight: React.FC = () => {
	return (
		<svg style={iconStyle} viewBox="0 0 448 512">
			<path
				fill={CURRENT_COLOR}
				d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"
			/>
		</svg>
	);
};
