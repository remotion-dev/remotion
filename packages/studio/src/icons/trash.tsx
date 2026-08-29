import type {SVGProps} from 'react';
import React from 'react';

export const TrashIcon: React.FC<
	SVGProps<SVGSVGElement> & {
		readonly color: string;
	}
> = ({color, ...props}) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" {...props}>
			<path
				fill={color}
				d="M160.5 27.4C162.5 20.6 168.8 16 175.8 16h96.4c7.1 0 13.3 4.6 15.3 11.4l11 36.6h-149l11-36.6zM116.1 64H16C7.2 64 0 71.2 0 80s7.2 16 16 16h416c8.8 0 16-7.2 16-16s-7.2-16-16-16H331.9l-13.7-45.8C312.1-2.1 293.4-16 272.2-16h-96.4c-21.2 0-39.9 13.9-46 34.2L116.1 64zM28.7 144l22.9 308.7c2.5 33.4 30.3 59.3 63.8 59.3h217.1c33.5 0 61.3-25.9 63.8-59.3L419.2 144h-32.1l-22.7 306.4c-1.2 16.7-15.2 29.6-31.9 29.6H115.4c-16.8 0-30.7-12.9-31.9-29.6L60.8 144H28.7z"
			/>
		</svg>
	);
};
