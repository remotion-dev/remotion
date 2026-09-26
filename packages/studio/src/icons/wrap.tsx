import type {SVGProps} from 'react';

// Font Awesome Pro v7.3.1, Copyright 2026 Fonticons, Inc.
// https://fontawesome.com/license (Commercial License)
export const WrapIcon: React.FC<
	SVGProps<SVGSVGElement> & {readonly color: string}
> = ({color, ...props}) => {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
			<path
				d="M160 112h320c26.5 0 48 21.5 48 48v64c0 26.5-21.5 48-48 48H160c-26.5 0-48-21.5-48-48v-64c0-26.5 21.5-48 48-48ZM192 272v112c0 35.3 28.7 64 64 64h48M352 368h128c26.5 0 48 21.5 48 48v64c0 26.5-21.5 48-48 48H352c-26.5 0-48-21.5-48-48v-64c0-26.5 21.5-48 48-48Z"
				fill="none"
				stroke={color}
				strokeWidth={28}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};
