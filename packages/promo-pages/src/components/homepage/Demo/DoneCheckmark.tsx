import React from 'react';
import {PALETTE} from '../layout/colors';

export const DoneCheckmark: React.FC = () => {
	return (
		<div
			style={{
				backgroundColor: PALETTE.BRAND,
				height: 26,
				width: 26,
				borderRadius: 13,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				animation: 'jump 0.2s ease-out',
			}}
		>
			<svg
				viewBox="0 0 20 20"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				style={{
					flexShrink: 0,
					width: 26,
				}}
			>
				<circle cx="10" cy="10" r="10" fill="#0B84F3" />
				<path
					d="M14.7908 7.20505C15.0697 7.47844 15.0697 7.92243 14.7908 8.19583L9.07711 13.795C8.79813 14.0683 8.34505 14.0683 8.06606 13.795L5.20924 10.9954C4.93025 10.722 4.93025 10.278 5.20924 10.0046C5.48823 9.73121 5.9413 9.73121 6.22029 10.0046L8.5727 12.3077L13.7819 7.20505C14.0609 6.93165 14.514 6.93165 14.793 7.20505H14.7908Z"
					fill="white"
					style={{
						transform: 'scale(1.2)',
						transformOrigin: 'center',
					}}
				/>
			</svg>
		</div>
	);
};
