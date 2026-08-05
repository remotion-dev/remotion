const Component: React.FC = () => {
	return (
		<div
			style={{
				position: 'absolute',
				left: 100,
				top: 190,
				width: 600,
				height: 120,
				backgroundColor: '#edf7ff',
				filter: 'drop-shadow(0 14px 20px rgba(18, 45, 58, 0.28))',
				rotate: '30deg',
			}}
		/>
	);
};

export const issue9901RotatedDropShadow = {
	component: Component,
	id: 'issue-9901-rotated-drop-shadow',
	width: 800,
	height: 500,
	fps: 30,
	durationInFrames: 1,
} as const;
