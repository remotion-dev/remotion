import type {SVGProps} from 'react';
import React from 'react';

export const EditorIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			viewBox="0 0 251 251"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect
				x="4"
				y="4"
				width="52"
				height="52"
				rx="15"
				stroke="currentColor"
				strokeWidth="16"
			/>
			<rect
				x="195"
				y="4"
				width="52"
				height="52"
				rx="15"
				stroke="currentColor"
				strokeWidth="16"
			/>
			<rect
				x="4"
				y="195"
				width="52"
				height="52"
				rx="15"
				stroke="currentColor"
				strokeWidth="16"
			/>
			<rect
				x="195"
				y="195"
				width="52"
				height="52"
				rx="15"
				stroke="currentColor"
				strokeWidth="16"
			/>
			<path d="M55 222H196" stroke="currentColor" strokeWidth="16" />
			<path d="M30 60L30 191" stroke="currentColor" strokeWidth="16" />
			<path d="M221 60V191" stroke="currentColor" strokeWidth="16" />
			<path d="M55 30H196" stroke="currentColor" strokeWidth="16" />
		</svg>
	);
};
