import React from 'react';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	gap: '10px',
};

const greyCircle: React.CSSProperties = {
	width: 20,
	height: 20,
	borderRadius: 10,
	backgroundColor: 'var(--footer-border)',
};

export const PricingBulletPoint: React.FC<{
	readonly text: React.ReactNode;
	readonly checked: boolean;
	readonly children?: React.ReactNode;
}> = ({text, checked, children}) => {
	const checkmarkSVG = (
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			style={{
				flexShrink: 0,
			}}
		>
			<circle cx="10" cy="10" r="10" fill="#0B84F3" />
			<path
				d="M14.7908 7.20505C15.0697 7.47844 15.0697 7.92243 14.7908 8.19583L9.07711 13.795C8.79813 14.0683 8.34505 14.0683 8.06606 13.795L5.20924 10.9954C4.93025 10.722 4.93025 10.278 5.20924 10.0046C5.48823 9.73121 5.9413 9.73121 6.22029 10.0046L8.5727 12.3077L13.7819 7.20505C14.0609 6.93165 14.514 6.93165 14.793 7.20505H14.7908Z"
				fill="white"
			/>
		</svg>
	);

	return (
		<div style={container}>
			{checked ? checkmarkSVG : <div style={greyCircle} />}
			<div className={'fontbrand text-lg	'}>
				{text}
				{children}
			</div>
		</div>
	);
};
