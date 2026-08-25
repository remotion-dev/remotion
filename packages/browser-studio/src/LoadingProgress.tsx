import React from 'react';

const loadingProgressAnimation = '__remotion_loading_progress_animation';

const wrapperStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
};

const logoStyle: React.CSSProperties = {
	marginBottom: 20,
	transform: 'rotate(90deg)',
};

const trackStyle: React.CSSProperties = {
	backgroundColor: '#1f2428',
	borderRadius: 2,
	height: 4,
	overflow: 'hidden',
	position: 'relative',
	width: 168,
};

const fillStyle: React.CSSProperties = {
	backgroundColor: '#2f363d',
	borderRadius: 2,
	height: '100%',
	transition: 'width 100ms linear',
};

export const LoadingProgress: React.FC<{
	readonly progress: number | null;
}> = ({progress}) => {
	const percentage = progress === null ? null : Math.round(progress * 100);

	return (
		<div style={wrapperStyle}>
			<style type="text/css">{`
				@keyframes ${loadingProgressAnimation} {
					0% { transform: translateX(-100%); }
					100% { transform: translateX(333%); }
				}
			`}</style>
			<svg
				aria-hidden="true"
				height={40}
				style={logoStyle}
				viewBox="-100 -100 400 400"
				width={40}
			>
				<path
					d="M 2 172 a 196 100 0 0 0 195 5 A 196 240 0 0 0 100 2.259 A 196 240 0 0 0 2 172 z"
					fill="#555"
					stroke="#555"
					strokeLinejoin="round"
					strokeWidth="100"
				/>
			</svg>
			<div
				aria-label="Loading Studio"
				aria-valuemax={100}
				aria-valuemin={0}
				aria-valuenow={percentage ?? undefined}
				role="progressbar"
				style={trackStyle}
			>
				<div
					style={
						progress === null
							? {
									...fillStyle,
									animation: `${loadingProgressAnimation} 1.1s ease-in-out infinite`,
									width: '30%',
								}
							: {...fillStyle, width: `${percentage}%`}
					}
				/>
			</div>
		</div>
	);
};
