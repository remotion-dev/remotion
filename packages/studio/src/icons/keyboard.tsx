import type {SVGProps} from 'react';

// Font Awesome Pro v7.3.1, Copyright 2026 Fonticons, Inc.
// https://fontawesome.com/license (Commercial License)
export const KeyboardIcon: React.FC<
	SVGProps<SVGSVGElement> & {readonly color: string}
> = ({color, ...props}) => {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
			<path
				fill={color}
				d="M96 192l64 0 0 128-64 0c-53 0-96 43-96 96s43 96 96 96 96-43 96-96l0-64 128 0 0 64c0 53 43 96 96 96s96-43 96-96-43-96-96-96l-64 0 0-128 64 0c53 0 96-43 96-96s-43-96-96-96-96 43-96 96l0 64-128 0 0-64c0-53-43-96-96-96S0 43 0 96 43 192 96 192zM256 320l-64 0 0-128 128 0 0 128-64 0zM96 160c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64l0 64-64 0zm64 256c0 35.3-28.7 64-64 64s-64-28.7-64-64 28.7-64 64-64l64 0 0 64zM352 160l0-64c0-35.3 28.7-64 64-64s64 28.7 64 64-28.7 64-64 64l-64 0zm64 192c35.3 0 64 28.7 64 64s-28.7 64-64 64-64-28.7-64-64l0-64 64 0z"
			/>
		</svg>
	);
};
