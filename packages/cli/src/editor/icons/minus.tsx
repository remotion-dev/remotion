import type {SVGProps} from 'react';
import React from 'react';

export const Minus: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
			<path
				fill="currentColor"
				d="M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z"
			/>
		</svg>
	);
};
