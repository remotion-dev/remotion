const TransformWithRotate: React.FC = () => {
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
				backgroundColor: 'rgb(100, 200, 255)',
			}}
		>
			<div
				style={{
					width: 400,
					height: 400,
					backgroundColor: 'rgb(100, 100, 255)',
					transform: 'scale(0.7) translateX(100px)',
					rotate: '30deg',
				}}
			/>
		</div>
	);
};

export const transformWithRotate = {
	component: TransformWithRotate,
	id: 'transform-with-rotate',
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 1,
} as const;
