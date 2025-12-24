const Orthographic: React.FC = () => {
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				width: 1080,
				height: 1080,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				overflow: 'hidden',
				backgroundColor: 'rgb(10, 17, 27)',
				transform: 'scale(0.3) rotateY(45deg)',
			}}
		/>
	);
};

export const orthographic = {
	component: Orthographic,
	id: 'orthographic',
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 1,
} as const;
