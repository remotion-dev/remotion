import type {SVGProps} from 'react';
import React from 'react';

export const AlignRightIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" {...props}>
			<rect fill="currentColor" x="13" y="1" width="1" height="14" rx="0.5" />
			<rect fill="currentColor" x="2" y="4" width="9.5" height="2.5" rx="1" />
			<rect fill="currentColor" x="6" y="9.5" width="5.5" height="2.5" rx="1" />
		</svg>
	);
};
