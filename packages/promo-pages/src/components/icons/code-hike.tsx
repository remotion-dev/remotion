import type {SVGProps} from 'react';
import React from 'react';

export const CodeHike: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg {...props} viewBox="-100 -100 200 200" fill="currentColor">
			<path d="M 70 60 L 42 -27 L 72 -27 L 100 60 Z" />
			<path d="M 20.419540229885058 40.05357142857142 L 42 -27 L 72 -27 L 50.41954022988506 40.05357142857142 Z" />
			<path d="M 20.419540229885058 40.05357142857142 L -15 -70 L 15 -70 L 50.41954022988506 40.05357142857142 Z" />
			<path d="M -50.41954022988506 40.05357142857142 L -15 -70 L 15 -70 L -20.419540229885058 40.05357142857142 Z" />
			<path d="M -50.41954022988506 40.05357142857142 L -72 -27 L -42 -27 L -20.419540229885058 40.05357142857142 Z" />
			<path d="M -100 60 L -72 -27 L -42 -27 L -70 60 Z" />
		</svg>
	);
};
