import React from 'react';
import {RED} from '../layout/colors';

export const DemoErrorIcon: React.FC = () => {
	return (
		<div
			style={{
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
				style={{
					flexShrink: 0,
					width: 26,
				}}
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 512 512"
			>
				<path
					fill={RED}
					d="M17.1 292c-12.9-22.3-12.9-49.7 0-72L105.4 67.1c12.9-22.3 36.6-36 62.4-36l176.6 0c25.7 0 49.5 13.7 62.4 36L494.9 220c12.9 22.3 12.9 49.7 0 72L406.6 444.9c-12.9 22.3-36.6 36-62.4 36l-176.6 0c-25.7 0-49.5-13.7-62.4-36L17.1 292zM256 128c-13.3 0-24 10.7-24 24l0 112c0 13.3 10.7 24 24 24s24-10.7 24-24l0-112c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
				/>
			</svg>
		</div>
	);
};
