import type {SVGProps} from 'react';

// Font Awesome Pro v7.3.1, Copyright 2026 Fonticons, Inc.
// https://fontawesome.com/license (Commercial License)
export const ClipboardIcon: React.FC<
	SVGProps<SVGSVGElement> & {color?: string}
> = ({color, ...props}) => (
	<svg viewBox="0 -32 384 576" {...props}>
		<path
			fill={color}
			d="M248 80L136 80c-13.3 0-24-10.7-24-24s10.7-24 24-24l112 0c13.3 0 24 10.7 24 24s-10.7 24-24 24zm0 32c28.2 0 51.6-20.9 55.4-48L320 64c17.7 0 32 14.3 32 32l0 352c0 17.7-14.3 32-32 32L64 480c-17.7 0-32-14.3-32-32L32 96c0-17.7 14.3-32 32-32l16.6 0c3.9 27.1 27.2 48 55.4 48l112 0zm50.6-80c-9-18.9-28.3-32-50.6-32L136 0C113.7 0 94.4 13.1 85.4 32L64 32C28.7 32 0 60.7 0 96L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-352c0-35.3-28.7-64-64-64l-21.4 0z"
		/>
	</svg>
);
