import type {SVGProps} from 'react';
import React from 'react';

export const AlignBottomIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" {...props}>
			<rect fill="currentColor" x="1" y="13" width="14" height="1" rx="0.5" />
			<rect fill="currentColor" x="4" y="2" width="2.5" height="9.5" rx="1" />
			<rect fill="currentColor" x="9.5" y="6" width="2.5" height="5.5" rx="1" />
		</svg>
	);
};
