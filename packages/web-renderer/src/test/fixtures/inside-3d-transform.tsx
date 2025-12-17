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
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					transform:
						'matrix3d(0.304437, -0.106834, 0, 0.00011, 0.135913, 0.347567, 0, 5e-05, 0, 0, 1, 0, 64, 140, 0, 1)',
					transformOrigin: '0px 0px 0px',
				}}
			>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						width: '100%',
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						backgroundColor: 'rgb(10, 17, 27)',
						justifyContent: 'center',
						alignItems: 'center',
						color: 'blue',
						fontSize: 700,
					}}
				>
					<div>0</div>
				</div>
			</div>
		</div>
	);
};

export const inside3dTransform = {
	component: Component,
	id: 'inside3dTransform',
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 1,
} as const;
