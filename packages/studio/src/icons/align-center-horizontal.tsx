import type {SVGProps} from 'react';
import React from 'react';

export const AlignCenterHorizontalIcon: React.FC<SVGProps<SVGSVGElement>> = (
	props,
) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" {...props}>
			<rect fill="currentColor" x="7.5" y="1" width="1" height="14" rx="0.5" />
			<rect fill="currentColor" x="3" y="4" width="10" height="2.5" rx="1" />
			<rect fill="currentColor" x="5" y="9.5" width="6" height="2.5" rx="1" />
		</svg>
	);
};
