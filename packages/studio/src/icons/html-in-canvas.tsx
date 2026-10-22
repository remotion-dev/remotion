import type {SVGProps} from 'react';

// Font Awesome Pro v7.3.1, Copyright 2026 Fonticons, Inc.
// https://fontawesome.com/license (Commercial License)
export const HtmlInCanvasIcon: React.FC<
	SVGProps<SVGSVGElement> & {readonly color: string}
> = ({color, ...props}) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" {...props}>
			<path
				fill={color}
				d="M90.6 89.1l-22.9 102.9 129.6 0 9.6-128-85.1 0c-15 0-28 10.4-31.2 25.1zM60.6 224L40.8 313.1C36.4 333 51.6 352 72 352l113.3 0 9.6-128-134.3 0zM217.4 352l141.5 0-9.6-128-122.3 0-9.6 128zM391 352l113.3 0c20.5 0 35.7-19 31.2-38.9l-19.8-89.1-134.3 0 9.6 128zM508.6 192L485.7 89.1C482.5 74.4 469.5 64 454.5 64l-85.1 0 9.6 128 129.6 0zM337.3 64l-98.3 0-9.6 128 117.5 0-9.6-128zM59.3 82.1C65.8 52.8 91.8 32 121.8 32l332.7 0c30 0 56 20.8 62.5 50.1l49.8 224c8.9 40-21.5 77.9-62.5 77.9l-200.1 0 0 96 96 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-224 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l96 0 0-96-200.1 0C31.1 384 .7 346.1 9.6 306.1l49.8-224z"
			/>
		</svg>
	);
};
