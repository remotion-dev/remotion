import type {SVGProps} from 'react';
import React from 'react';

export const PromptToVideoIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
			<path
				d="M278.5 15.6C275 6.2 266 0 256 0s-19 6.2-22.5 15.6L174.2 174.2 15.6 233.5C6.2 237 0 246 0 256s6.2 19 15.6 22.5l158.6 59.4 59.4 158.6C237 505.8 246 512 256 512s19-6.2 22.5-15.6l59.4-158.6 158.6-59.4C505.8 275 512 266 512 256s-6.2-19-15.6-22.5L337.8 174.2 278.5 15.6z"
				fill="currentColor"
			/>
		</svg>
	);
};
