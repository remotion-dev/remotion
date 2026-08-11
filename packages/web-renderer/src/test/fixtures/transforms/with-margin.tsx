const WithMargin: React.FC = () => {
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				width: 1080,
				height: 1080,
				display: 'flex',
				marginTop: 400,
				transform: 'scale(0.5) rotateX(0.0001deg)',
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					width: 1080,
					height: 1080,
					display: 'flex',
					flexDirection: 'column',
					overflow: 'hidden',
					backgroundColor: 'rgb(10, 17, 255)',
				}}
			/>
		</div>
	);
};

export const withMargin = {
	component: WithMargin,
	id: 'with-margin',
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 1,
} as const;
