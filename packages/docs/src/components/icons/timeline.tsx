import type {SVGProps} from 'react';
import React from 'react';

export const TimelineIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			{...props}
			viewBox="0 0 56 69"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M51.4313 38.0917L31.4998 52.4424C30.2419 53.3481 28.5581 53.3925 27.2543 52.5543L4.73299 38.0763C3.65291 37.382 3 36.1861 3 34.9021V6.77359C3 4.68949 4.68949 3 6.77358 3H49.2264C51.3105 3 53 4.68949 53 6.77358V35.0293C53 36.243 52.4163 37.3826 51.4313 38.0917Z"
				stroke="black"
				strokeWidth="5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M29 55L29 66"
				stroke="black"
				strokeWidth="5"
				strokeLinecap="square"
			/>
		</svg>
	);
};
