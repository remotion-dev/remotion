import React from 'react';

const style: React.CSSProperties = {
	display: 'block',
	height: 10,
	transition: 'var(--remotion-disclosure-transition, transform 150ms ease)',
	width: 6,
};

export const DisclosureChevron: React.FC<{
	readonly expanded: boolean;
}> = ({expanded}) => (
	<svg
		viewBox="0 0 6 10"
		style={{...style, transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)'}}
	>
		<path
			d="M1.5 1.5L4.5 5L1.5 8.5"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1"
		/>
	</svg>
);
