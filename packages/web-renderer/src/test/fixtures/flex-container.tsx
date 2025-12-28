const Component: React.FC = () => {
	return (
		<div
			style={{
				borderRadius: 50,
				background: 'rgb(230, 225, 252)',
				display: 'inline-flex',
				flexDirection: 'row',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					height: 160,
					width: 160,
				}}
			/>
		</div>
	);
};

export const flexContainer = {
	component: Component,
	id: 'flex-container',
	width: 400,
	height: 400,
	fps: 30,
	durationInFrames: 100,
} as const;
