import React from 'react';

export const EditorIcon: React.FC<{
	readonly style?: React.CSSProperties;
}> = ({style}) => {
	return (
		<svg style={style} viewBox="0 0 24 24" fill="currentColor">
			<rect
				x="2"
				y="3"
				width="20"
				height="18"
				rx="2"
				ry="2"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<rect
				x="4"
				y="5"
				width="16"
				height="3"
				fill="currentColor"
				opacity="0.3"
			/>
			<rect
				x="4"
				y="9"
				width="6"
				height="8"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<rect
				x="11"
				y="9"
				width="9"
				height="4"
				fill="currentColor"
				opacity="0.6"
			/>
			<rect
				x="11"
				y="14"
				width="9"
				height="3"
				fill="currentColor"
				opacity="0.4"
			/>
			<circle cx="6" cy="6.5" r="0.5" fill="currentColor" />
			<circle cx="7.5" cy="6.5" r="0.5" fill="currentColor" />
			<circle cx="9" cy="6.5" r="0.5" fill="currentColor" />
			<path d="M5 11h4M5 13h3M5 15h4" stroke="currentColor" strokeWidth="0.5" />
		</svg>
	);
};
