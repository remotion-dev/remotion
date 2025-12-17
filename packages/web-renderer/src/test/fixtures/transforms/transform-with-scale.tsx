const TransformWithScale: React.FC = () => {
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				width: 1080,
				height: 1080,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				overflow: 'hidden',
				backgroundColor: 'rgb(255, 200, 100)',
			}}
		>
			<div
				style={{
					width: 400,
					height: 400,
					backgroundColor: 'rgb(255, 100, 100)',
					transform: 'rotate(45deg)',
					scale: '0.5',
				}}
			/>
		</div>
	);
};

export const transformWithScale = {
	component: TransformWithScale,
	id: 'transform-with-scale',
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 1,
} as const;
