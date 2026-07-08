import type {SVGProps} from 'react';
import React from 'react';

export const MagnetIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
			<path
				transform="rotate(180 256 256)"
				d="M32 176v112c0 123.7 100.3 224 224 224s224-100.3 224-224V176H352v112c0 53-43 96-96 96s-96-43-96-96V176H32zm0-48h128V64c0-17.7-14.3-32-32-32H64C46.3 32 32 46.3 32 64v64zm320 0h128V64c0-17.7-14.3-32-32-32h-64c-17.7 0-32 14.3-32 32v64z"
			/>
		</svg>
	);
};
