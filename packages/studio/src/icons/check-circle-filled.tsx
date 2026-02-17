import React from 'react';

export const CheckCircleFilled: React.FC<React.SVGProps<SVGSVGElement>> = (
	props,
) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		style={{width: 14, height: 14}}
		viewBox="0 0 512 512"
		{...props}
	>
		<path d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zM374 145.7c-10.7-7.8-25.7-5.4-33.5 5.3L221.1 315.2 169 263.1c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l72 72c5 5 11.8 7.5 18.8 7s13.4-4.1 17.5-9.8L379.3 179.2c7.8-10.7 5.4-25.7-5.3-33.5z" />
	</svg>
);
