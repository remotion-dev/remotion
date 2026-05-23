import React from 'react';

export const BookFlipTocPreview: React.FC = () => {
	return (
		<div
			style={{
				width: 108,
				height: 60,
				flex: 'none',
				borderRadius: 6,
				overflow: 'hidden',
				display: 'flex',
				boxShadow: '0 1px 6px rgba(0, 0, 0, 0.18)',
				background:
					'linear-gradient(90deg, #0b84f3 0 50%, #f3a7c4 50% 100%)',
				position: 'relative',
				fontFamily: 'sans-serif',
				fontWeight: 900,
				color: 'white',
			}}
		>
			<div
				style={{
					flex: 1,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: 26,
				}}
			>
				A
			</div>
			<div
				style={{
					flex: 1,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: 26,
				}}
			>
				B
			</div>
			<div
				style={{
					position: 'absolute',
					top: 0,
					bottom: 0,
					left: '50%',
					width: 2,
					marginLeft: -1,
					background: 'rgba(255, 255, 255, 0.6)',
				}}
			/>
		</div>
	);
};
