import type {SVGProps} from 'react';

export const CubeIcon = ({
	color,
	...props
}: SVGProps<SVGSVGElement> & {readonly color: string}) => (
	<svg viewBox="0 0 14 14" fill="none" {...props}>
		<path
			stroke={color}
			strokeWidth="1"
			strokeLinejoin="round"
			d="M7 .5 13 4v6L7 13.5 1 10V4L7 .5ZM1 4l6 3.5L13 4M7 7.5v6"
		/>
	</svg>
);
