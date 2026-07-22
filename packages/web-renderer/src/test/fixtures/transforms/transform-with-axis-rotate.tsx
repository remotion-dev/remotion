const TransformWithAxisRotate: React.FC = () => {
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
					rotate: 'x 45deg',
				}}
			/>
		</div>
	);
};

export const transformWithAxisRotate = {
	component: TransformWithAxisRotate,
	id: 'transform-with-axis-rotate',
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 1,
} as const;
