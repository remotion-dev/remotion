import type {SVGProps} from 'react';

export const FileIcon: React.FC<SVGProps<SVGSVGElement> & {color?: string}> = ({
	color,
	...props
}) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" {...props}>
		<path
			fill={color ?? 'currentColor'}
			d="M0 64C0 28.65 28.65 0 64 0h156.1c12.7 0 25 5.057 34 14.06L369.9 129.9c9 9 14.1 21.3 14.1 34V448c0 35.3-28.7 64-64 64H64c-35.35 0-64-28.7-64-64V64zm352 128H240c-26.5 0-48-21.5-48-48V32H64c-17.67 0-32 14.33-32 32v384c0 17.7 14.33 32 32 32h256c17.7 0 32-14.3 32-32V192zm-4.7-39.4L231.4 36.69c-2-2.07-4.6-3.51-7.4-4.21V144c0 8.8 7.2 16 16 16h111.5c-.7-2.8-2.1-5.4-4.2-7.4z"
		/>
	</svg>
);
