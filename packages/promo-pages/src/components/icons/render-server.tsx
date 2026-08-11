import type {SVGProps} from 'react';
import React from 'react';

export const RenderServerIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect width="18" height="18" x="3" y="3" rx="2" />
			<path d="m10 8 4 4-4 4" />
		</svg>
	);
};
