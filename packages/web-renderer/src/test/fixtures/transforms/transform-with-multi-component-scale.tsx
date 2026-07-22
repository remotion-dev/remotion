const TransformWithMultiComponentScale: React.FC = () => {
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
					scale: '0.5 1.5',
				}}
			/>
		</div>
	);
};

export const transformWithMultiComponentScale = {
	component: TransformWithMultiComponentScale,
	id: 'transform-with-multi-component-scale',
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 1,
} as const;
