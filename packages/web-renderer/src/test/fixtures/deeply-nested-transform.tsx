const Component: React.FC = () => {
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: 'white',
			}}
		>
			<div
				style={{
					width: 40,
					height: 40,
					transform: 'rotateY(1deg)',
					backgroundColor: 'yellow',
				}}
			>
				<div
					style={{
						width: 150,
						height: 150,
						position: 'absolute',
						backgroundColor: 'red',
						transform: 'rotateY(-0.5rad)',
						opacity: 0.5,
					}}
				/>
			</div>
		</div>
	);
};

export const deeplyNestedTransform = {
	component: Component,
	id: 'deeply-nested-transform',
	width: 200,
	height: 200,
	fps: 30,
	durationInFrames: 100,
} as const;
