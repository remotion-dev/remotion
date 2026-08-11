const TransformWithAllShorthands: React.FC = () => {
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
				backgroundColor: 'rgb(50, 200, 150)',
			}}
		>
			<div
				style={{
					width: 400,
					height: 400,
					backgroundColor: 'rgb(100, 255, 150)',
					transform: 'skewX(10deg)',
					scale: '0.6',
					rotate: '45deg',
					translate: '-50px 100px',
				}}
			/>
		</div>
	);
};

export const transformWithAllShorthands = {
	component: TransformWithAllShorthands,
	id: 'transform-with-all-shorthands',
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 1,
} as const;
