import type {SVGProps} from 'react';
import React from 'react';

export const OverlayIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			viewBox="0 0 576 512"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M251.1 407.9C274.5 418.7 301.5 418.7 324.9 407.9V407.8L476.9 337.6L530.1 362.2C538.6 366.1 544 374.6 544 384C544 393.4 538.6 401.9 530.1 405.8L311.5 506.8C296.6 513.7 279.4 513.7 264.5 506.8L45.9 405.8C37.4 401.9 32 393.4 32 384C32 374.6 37.4 366.1 45.9 362.2L99.1 337.7L251.1 407.9Z"
				fill="currentcolor"
			/>
			<path
				d="M277.8 132.7L495.2 230.1C505.4 234.7 512 244.8 512 256C512 267.2 505.4 277.3 495.2 281.9L277.8 379.3C270.1 382.4 263.5 384 256 384C248.5 384 241 382.4 234.2 379.3L16.76 281.9C6.561 277.3 0.0003 267.2 0.0003 256C0.0003 244.8 6.561 234.7 16.76 230.1L234.2 132.7C241 129.6 248.5 128 256 128C263.5 128 270.1 129.6 277.8 132.7Z"
				stroke="currentcolor"
				transform="translate(32, -25)"
				strokeWidth="36"
			/>
		</svg>
	);
};
