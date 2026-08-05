import type {SVGProps} from 'react';

export const BorderRadiusIcon = ({
	color,
	...props
}: SVGProps<SVGSVGElement> & {readonly color: string}) => {
	return (
		<svg viewBox="0 0 16 16" fill="none" {...props}>
			<path
				d="M2.5 3.5H6.5C10.4 3.5 12.5 5.6 12.5 9.5V13.5"
				stroke={color}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
			/>
		</svg>
	);
};
