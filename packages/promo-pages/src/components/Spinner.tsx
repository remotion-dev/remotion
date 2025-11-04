import type {SVGProps} from 'react';
import React from 'react';

export const Spinner: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			id="loading"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 32 32"
			width="32"
			height="32"
			fill="currentColor"
			{...props}
		>
			<path opacity=".1" d="M14 0 H18 V8 H14 z" transform="rotate(0 16 16)">
				<animate
					attributeName="opacity"
					from="1"
					to=".1"
					dur="1s"
					repeatCount="indefinite"
					begin="0"
				/>
			</path>
			<path opacity=".1" d="M14 0 H18 V8 H14 z" transform="rotate(45 16 16)">
				<animate
					attributeName="opacity"
					from="1"
					to=".1"
					dur="1s"
					repeatCount="indefinite"
					begin="0.125s"
				/>
			</path>
			<path opacity=".1" d="M14 0 H18 V8 H14 z" transform="rotate(90 16 16)">
				<animate
					attributeName="opacity"
					from="1"
					to=".1"
					dur="1s"
					repeatCount="indefinite"
					begin="0.25s"
				/>
			</path>
			<path opacity=".1" d="M14 0 H18 V8 H14 z" transform="rotate(135 16 16)">
				<animate
					attributeName="opacity"
					from="1"
					to=".1"
					dur="1s"
					repeatCount="indefinite"
					begin="0.375s"
				/>
			</path>
			<path opacity=".1" d="M14 0 H18 V8 H14 z" transform="rotate(180 16 16)">
				<animate
					attributeName="opacity"
					from="1"
					to=".1"
					dur="1s"
					repeatCount="indefinite"
					begin="0.5s"
				/>
			</path>
			<path opacity=".1" d="M14 0 H18 V8 H14 z" transform="rotate(225 16 16)">
				<animate
					attributeName="opacity"
					from="1"
					to=".1"
					dur="1s"
					repeatCount="indefinite"
					begin="0.675s"
				/>
			</path>
			<path opacity=".1" d="M14 0 H18 V8 H14 z" transform="rotate(270 16 16)">
				<animate
					attributeName="opacity"
					from="1"
					to=".1"
					dur="1s"
					repeatCount="indefinite"
					begin="0.75s"
				/>
			</path>
			<path opacity=".1" d="M14 0 H18 V8 H14 z" transform="rotate(315 16 16)">
				<animate
					attributeName="opacity"
					from="1"
					to=".1"
					dur="1s"
					repeatCount="indefinite"
					begin="0.875s"
				/>
			</path>
		</svg>
	);
};
