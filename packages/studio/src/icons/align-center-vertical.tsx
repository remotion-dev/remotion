import type {SVGProps} from 'react';
import React from 'react';

export const AlignCenterVerticalIcon: React.FC<SVGProps<SVGSVGElement>> = (
	props,
) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" {...props}>
			<rect fill="currentColor" x="1" y="7.5" width="14" height="1" rx="0.5" />
			<rect fill="currentColor" x="4" y="3" width="2.5" height="10" rx="1" />
			<rect fill="currentColor" x="9.5" y="5" width="2.5" height="6" rx="1" />
		</svg>
	);
};
