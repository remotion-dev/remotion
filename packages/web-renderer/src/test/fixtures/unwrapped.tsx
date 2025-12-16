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
				transform:
					'rotate(-0.00201941rad) scale(1.05) translate(-1.71807px, -1.89451px)',
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					display: 'flex',
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
							transform: 'scale(0.43) translateX(-460px) translateY(1048px)',
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
									color: 'white',
									fontSize: 700,
									fontFamily: '"Seven Segment"',
								}}
							>
								<div
									style={{
										display: 'flex',
										flexDirection: 'row',
									}}
								/>
							</div>
						</div>
					</div>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							width: '100%',
							height: '100%',
							display: 'flex',
							flexDirection: 'column',
							marginLeft: 881,
							marginTop: 853,
							transform: 'scale(1.51)',
							opacity: 1,
						}}
					>
						<div
							style={{
								position: 'absolute',
								inset: 0,
								width: 1080,
								height: 1080,
								display: 'flex',
								flexDirection: 'column',
								transform:
									'matrix3d(0.054203, 0.018674, 0, -7.5e-05, -0.029199, 0.08233, 0, 1.3e-05, 0, 0, 1, 0, 139, 125, 0, 1)',
								transformOrigin: '0px 0px 0px',
							}}
						>
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
										opacity: 0.8,
										scale: 0.75,
										pointerEvents: 'none',
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export const unwrapped = {
	component: Component,
	id: 'unwrapped',
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 1,
} as const;
