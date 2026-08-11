import type {SVGProps} from 'react';
import React from 'react';

export const AlignRightIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	const color = props.color ?? 'currentColor';

	return (
		<svg {...props} viewBox="0 0 16 16" fill="none">
			<path
				d="M14 2V14"
				stroke={color}
				strokeOpacity="0.5"
				strokeLinecap="square"
			/>
			<line x1="3" y1="6" x2="12" y2="6" stroke={color} strokeWidth="2" />
			<line x1="5" y1="10" x2="12" y2="10" stroke={color} strokeWidth="2" />
		</svg>
	);
};
