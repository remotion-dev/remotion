import type {SVGProps} from 'react';

export const CubeIcon = ({
	color,
	...props
}: SVGProps<SVGSVGElement> & {readonly color: string}) => (
	<svg viewBox="0 0 512 512" {...props}>
		<path
			fill={color}
			d="M234.5 5.7c13.6-7.6 29.3-7.6 42.9 0l192 107.3c14.2 7.9 22.9 22.9 22.9 39.2v207.6c0 16.3-8.8 31.2-22.9 39.2l-192 107.3c-13.6 7.6-29.3 7.6-42.9 0l-192-107.3c-14.2-7.9-22.9-22.9-22.9-39.2V152.2c0-16.3 8.8-31.2 22.9-39.2l192-107.3zM256 50.4L82.2 147.5 256 244.7l173.8-97.2L256 50.4zm-192 137v172.4l168 93.9V281.3L64 187.4zm216 266.3l168-93.9V187.4l-168 93.9v172.4z"
		/>
	</svg>
);
