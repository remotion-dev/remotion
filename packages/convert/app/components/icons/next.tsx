import React from 'react';

export const NextIcon: React.FC<{
	readonly style: React.CSSProperties;
}> = ({style}) => {
	return (
		<svg
			fill="none"
			viewBox="0 0 180 180"
			style={style}
			xmlns="http://www.w3.org/2000/svg"
		>
			<mask
				height="180"
				id="mask0_292_250"
				maskUnits="userSpaceOnUse"
				style={{maskType: 'alpha'}}
				width="180"
				x="0"
				y="0"
			>
				<circle cx="90" cy="90" fill="currentcolor" r="90" />
			</mask>
			<g mask="url(#mask0_292_250)">
				<circle cx="90" cy="90" fill="currentcolor" r="90" />
				<path
					d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
					fill="url(#paint0_linear_292_250)"
				/>
				<rect
					fill="url(#paint1_linear_292_250)"
					height="72"
					width="12"
					x="115"
					y="54"
				/>
			</g>
			<defs>
				<linearGradient
					gradientUnits="userSpaceOnUse"
					id="paint0_linear_292_250"
					x1="109"
					x2="144.5"
					y1="116.5"
					y2="160.5"
				>
					<stop stopColor="var(--background)" />
					<stop offset="1" stopColor="var(--background)" stopOpacity="0" />
				</linearGradient>
				<linearGradient
					gradientUnits="userSpaceOnUse"
					id="paint1_linear_292_250"
					x1="121"
					x2="120.799"
					y1="54"
					y2="106.875"
				>
					<stop stopColor="var(--background)" />
					<stop offset="1" stopColor="var(--background)" stopOpacity="0" />
				</linearGradient>
			</defs>
		</svg>
	);
};
