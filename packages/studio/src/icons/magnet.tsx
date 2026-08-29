import type {SVGProps} from 'react';
import React from 'react';

export const MagnetIcon: React.FC<
	Omit<SVGProps<SVGSVGElement>, 'color'> & {readonly color: string}
> = ({color, ...props}) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" {...props}>
			<path
				fill={color}
				transform="rotate(180 224 256)"
				d="M48 64c-8.8 0-16 7.2-16 16l0 80 80 0 0-80c0-8.8-7.2-16-16-16L48 64zM32 288c0 106 86 192 192 192s192-86 192-192l0-96-80 0 0 96c0 61.9-50.1 112-112 112S112 349.9 112 288l0-96-80 0 0 96zM416 160l0-80c0-8.8-7.2-16-16-16l-48 0c-8.8 0-16 7.2-16 16l0 80 80 0zM0 80C0 53.5 21.5 32 48 32l48 0c26.5 0 48 21.5 48 48l0 208c0 44.2 35.8 80 80 80s80-35.8 80-80l0-208c0-26.5 21.5-48 48-48l48 0c26.5 0 48 21.5 48 48l0 208c0 123.7-100.3 224-224 224S0 411.7 0 288L0 80z"
			/>
		</svg>
	);
};
