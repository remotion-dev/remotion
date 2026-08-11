import type {SVGProps} from 'react';

export const FontFileIcon = ({
	color,
	...props
}: SVGProps<SVGSVGElement> & {readonly color: string}) => {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
			<path
				fill={color}
				d="M256 32c6.4 0 12.2 3.8 14.7 9.8L442.6 448 480 448c8.8 0 16 7.2 16 16s-7.2 16-16 16l-112 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l39.9 0-40.6-96-222.5 0-40.6 96 39.9 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L32 480c-8.8 0-16-7.2-16-16s7.2-16 16-16l37.4 0 171.9-406.2c2.5-5.9 8.3-9.8 14.7-9.8zM158.3 320L353.7 320 256 89.1 158.3 320z"
			/>
		</svg>
	);
};
