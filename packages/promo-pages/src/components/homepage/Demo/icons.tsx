import type {SVGProps} from 'react';
import React from 'react';
import {RED} from '../layout/colors';

export const IconLeft: React.FC<SVGProps<SVGSVGElement>> = (props) => (
	<svg viewBox="0 0 320 512" {...props}>
		<path
			fill="currentColor"
			d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"
		/>
	</svg>
);
export const IconRight: React.FC<SVGProps<SVGSVGElement>> = (props) => (
	<svg viewBox="0 0 320 512" {...props}>
		<path
			fill="currentColor"
			d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"
		/>
	</svg>
);

export const CancelIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			aria-hidden="true"
			focusable="false"
			data-prefix="fas"
			data-icon="times"
			className="svg-inline--fa fa-times fa-w-11"
			role="img"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 352 512"
			{...props}
		>
			<path
				fill="currentColor"
				d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"
			/>
		</svg>
	);
};

export const PausedIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			aria-hidden="true"
			focusable="false"
			data-prefix="fas"
			data-icon="play"
			className="svg-inline--fa fa-play fa-w-14"
			role="img"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 448 512"
			{...props}
		>
			<path
				fill="currentColor"
				d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"
			/>
		</svg>
	);
};

export const PlayingIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 320 512"
			fill="currentColor"
			{...props}
		>
			<path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z" />
		</svg>
	);
};

export const FullscreenIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 448 512"
			fill="currentColor"
			{...props}
		>
			<path d="M32 32C14.3 32 0 46.3 0 64l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96z" />
		</svg>
	);
};

export const NotMutedIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			{...props}
			viewBox="0 0 640 512"
			fill="currentColor"
		>
			<path d="M32 160l0 192 128 0L304 480l48 0 0-448-48 0L160 160 32 160zM441.6 332.8C464.9 315.3 480 287.4 480 256s-15.1-59.3-38.4-76.8l-28.8 38.4c11.7 8.8 19.2 22.7 19.2 38.4s-7.5 29.6-19.2 38.4l28.8 38.4zm57.6 76.8c46.6-35 76.8-90.8 76.8-153.6s-30.2-118.6-76.8-153.6l-28.8 38.4c35 26.3 57.6 68.1 57.6 115.2s-22.6 88.9-57.6 115.2l28.8 38.4z" />
		</svg>
	);
};

export const IsMutedIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			{...props}
			viewBox="0 0 640 512"
			fill={RED}
		>
			<path d="M48.4 14.8L29.4 .1 0 38l19 14.7L591.5 497.2l19 14.7L639.9 474l-19-14.7-95.1-73.8C557 351.3 576 305.9 576 256c0-62.8-30.2-118.6-76.8-153.6l-28.8 38.4c35 26.3 57.6 68.1 57.6 115.2c0 38.8-15.3 74-40.3 99.9l-38.2-29.7C468.3 308.7 480 283.7 480 256c0-31.4-15.1-59.3-38.4-76.8l-28.8 38.4c11.7 8.8 19.2 22.7 19.2 38.4s-7.5 29.6-19.2 38.4l5.9 7.9L352 250.5 352 32l-48 0L195.2 128.7 48.4 14.8zM352 373.3L81.2 160 32 160l0 192 128 0L304 480l48 0 0-106.7z" />
		</svg>
	);
};
