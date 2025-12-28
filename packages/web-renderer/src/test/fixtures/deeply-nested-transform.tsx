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
			}}
		>
			<div
				style={{
					position: 'relative',
					transform: 'scale(1) rotateY(9deg) rotateX(0rad) translateY(0px)',
				}}
			>
				<div
					style={{
						display: 'inline-flex',
						flexDirection: 'row',
						padding: '20px 70px 20px 20px',
						alignItems: 'center',
					}}
				>
					<div
						style={{
							width: 160,
							height: 160,
							transform: 'rotateY(-0.413981rad)',
							position: 'absolute',
							backgroundColor: 'red',
						}}
					/>
				</div>
			</div>
		</div>
	);
};

export const deeplyNestedTransform = {
	component: Component,
	id: 'deeply-nested-transform',
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 100,
} as const;
