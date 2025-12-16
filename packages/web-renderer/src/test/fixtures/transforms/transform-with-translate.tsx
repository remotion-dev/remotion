const TransformWithTranslate: React.FC = () => {
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
				backgroundColor: 'rgb(200, 100, 255)',
			}}
		>
			<div
				style={{
					width: 400,
					height: 400,
					backgroundColor: 'rgb(150, 50, 200)',
					transform: 'scale(0.8) rotate(15deg)',
					translate: '100px 50px',
				}}
			/>
		</div>
	);
};

export const transformWithTranslate = {
	component: TransformWithTranslate,
	id: 'transform-with-translate',
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 1,
} as const;
