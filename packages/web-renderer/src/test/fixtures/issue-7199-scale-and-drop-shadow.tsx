import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#222',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					transform: 'translate3d(0, 0, 0) scale(0.6)',
					display: 'flex',
					placeItems: 'center',
					justifyContent: 'center',
				}}
			>
				<div
					id="word-wrapper"
					style={{
						display: 'flex',
						flexDirection: 'column',
						filter: 'drop-shadow(rgba(0, 0, 0, 0.35) 5px 5px 15px)',
					}}
				>
					<div
						style={{
							textAlign: 'center',
							width: '100%',
							position: 'relative',
							overflow: 'visible',
						}}
					>
						<div
							style={{
								display: 'block',
								position: 'relative',
								fontFamily: 'sans-serif',
								fontSize: 32,
								lineHeight: 0.9,
								color: 'rgb(255, 255, 255)',
								textAlign: 'center',
								opacity: 1,
							}}
						>
							<span
								style={{
									fontFamily: 'sans-serif',
									fontSize: 80,
									color: 'rgb(160, 216, 62)',
									display: 'inline-block',
									textAlign: 'center',
									textShadow: 'none',
									fontWeight: 900,
									lineHeight: 0.9,
									textTransform: 'uppercase',
									opacity: 1,
									backgroundClip: 'text',
									WebkitTextFillColor: 'transparent',
									backgroundImage:
										'linear-gradient(90deg, rgb(160, 216, 62) 0%, rgb(160, 216, 62) 100%)',
									whiteSpace: 'pre',
								}}
							>
								scaled
							</span>
						</div>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const issue7199ScaleAndDropShadow = {
	component: Component,
	id: 'issue-7199-scale-and-drop-shadow',
	width: 800,
	height: 400,
	fps: 25,
	durationInFrames: 1,
} as const;
