import type {SVGProps} from 'react';

// Font Awesome Pro v7.3.1, Copyright 2026 Fonticons, Inc.
// https://fontawesome.com/license (Commercial License)
export const BookIcon: React.FC<
	SVGProps<SVGSVGElement> & {readonly color: string}
> = ({color, ...props}) => {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
			<path
				fill={color}
				d="M0 64C0 28.7 28.7 0 64 0L400 0c26.5 0 48 21.5 48 48l0 320c0 20.9-13.4 38.7-32 45.3l0 66.7 16 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L64 512c-35.3 0-64-28.7-64-64l0 0 0-384zM64 416c-17.7 0-32 14.3-32 32s14.3 32 32 32l320 0 0-64-320 0zM32 392.6c9.4-5.4 20.3-8.6 32-8.6l336 0c8.8 0 16-7.2 16-16l0-320c0-8.8-7.2-16-16-16L64 32C46.3 32 32 46.3 32 64l0 328.6zM144 128l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 96l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z"
			/>
		</svg>
	);
};
