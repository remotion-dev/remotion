import React from 'react';

const loadingProgressAnimation = '__remotion_loading_progress_animation';

const wrapperStyle: React.CSSProperties = {
	width: 240,
};

const labelRowStyle: React.CSSProperties = {
	color: '#a6a7a9',
	display: 'flex',
	fontSize: 12,
	justifyContent: 'space-between',
	marginBottom: 10,
};

const trackStyle: React.CSSProperties = {
	backgroundColor: '#1f2428',
	borderRadius: 2,
	height: 4,
	overflow: 'hidden',
	position: 'relative',
	width: '100%',
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
			<div style={labelRowStyle}>
				<span>Loading Studio</span>
				{percentage === null ? null : <span>{percentage}%</span>}
			</div>
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
