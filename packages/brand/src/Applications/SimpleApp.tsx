import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ExtrudeDiv} from '../3DContext/Div3D';

export function ApplicationSimpleApp() {
	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				justifyContent: 'flex-start',
				paddingTop: 62,
			}}
		>
			<ExtrudeDiv
				backFace={
					<div
						style={{
							backgroundColor: '#cfd6df',
							border: '4px solid #111111',
							borderRadius: 30,
							height: '100%',
							width: '100%',
						}}
					/>
				}
				cornerRadius={30}
				depth={46}
				height={724}
				name="Simple application"
				rotationX={-Math.PI / 24}
				rotationY={-Math.PI / 30}
				rotationZ={0.01}
				scaleX={1.08}
				scaleY={1.08}
				scaleZ={1.08}
				width={820}
			>
				<div
					style={{
						backgroundColor: '#ffffff',
						border: '4px solid #111111',
						borderRadius: 30,
						fontFamily: 'GT Planar, sans-serif',
						height: '100%',
						overflow: 'hidden',
						width: '100%',
					}}
				>
					<div
						style={{
							alignItems: 'center',
							borderBottom: '2px solid #e5e7eb',
							display: 'flex',
							height: 72,
							justifyContent: 'space-between',
							padding: '0 26px',
						}}
					>
						<div style={{display: 'flex', gap: 9}}>
							<div
								style={{
									backgroundColor: '#ff5f57',
									borderRadius: '50%',
									height: 16,
									width: 16,
								}}
							/>
							<div
								style={{
									backgroundColor: '#febc2e',
									borderRadius: '50%',
									height: 16,
									width: 16,
								}}
							/>
							<div
								style={{
									backgroundColor: '#28c840',
									borderRadius: '50%',
									height: 16,
									width: 16,
								}}
							/>
						</div>
						<div style={{color: '#4b5563', fontSize: 18, fontWeight: 500}}>
							acme-video.app
						</div>
						<div style={{width: 66}} />
					</div>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: 22,
							padding: 28,
						}}
					>
						<div
							style={{
								alignItems: 'center',
								background:
									'linear-gradient(145deg, #111827 0%, #172b4d 55%, #0b84f3 140%)',
								borderRadius: 18,
								display: 'flex',
								height: 332,
								justifyContent: 'center',
								overflow: 'hidden',
								position: 'relative',
							}}
						>
							<div
								style={{
									backgroundColor: 'rgba(11, 132, 243, 0.18)',
									borderRadius: '50%',
									filter: 'blur(2px)',
									height: 330,
									position: 'absolute',
									right: -80,
									top: -90,
									width: 330,
								}}
							/>
							<Img
								src={staticFile('logo/remotion/withouttitle-white.png')}
								style={{height: 164, objectFit: 'contain', width: 164}}
							/>
							<div
								style={{
									alignItems: 'center',
									bottom: 22,
									display: 'flex',
									gap: 16,
									left: 24,
									position: 'absolute',
									right: 24,
								}}
							>
								<div
									style={{
										borderColor: 'transparent transparent transparent white',
										borderStyle: 'solid',
										borderWidth: '10px 0 10px 16px',
										height: 0,
										width: 0,
									}}
								/>
								<div
									style={{
										backgroundColor: 'rgba(255, 255, 255, 0.3)',
										borderRadius: 5,
										flex: 1,
										height: 7,
										overflow: 'hidden',
									}}
								>
									<div
										style={{
											backgroundColor: '#0b84f3',
											borderRadius: 5,
											height: '100%',
											width: '38%',
										}}
									/>
								</div>
								<div style={{color: 'white', fontSize: 17}}>0:12 / 0:30</div>
							</div>
						</div>
						<div style={{display: 'flex', gap: 18}}>
							<div
								style={{
									display: 'flex',
									flex: 1,
									flexDirection: 'column',
									gap: 10,
								}}
							>
								<div style={{color: '#6b7280', fontSize: 18, fontWeight: 500}}>
									Headline
								</div>
								<div
									style={{
										alignItems: 'center',
										backgroundColor: '#f8fafc',
										border: '2px solid #d9dee7',
										borderRadius: 12,
										color: '#15171a',
										display: 'flex',
										fontSize: 22,
										height: 58,
										padding: '0 18px',
									}}
								>
									Summer collection
								</div>
							</div>
							<div
								style={{
									display: 'flex',
									flex: 1,
									flexDirection: 'column',
									gap: 10,
								}}
							>
								<div style={{color: '#6b7280', fontSize: 18, fontWeight: 500}}>
									Format
								</div>
								<div
									style={{
										alignItems: 'center',
										backgroundColor: '#f8fafc',
										border: '2px solid #d9dee7',
										borderRadius: 12,
										color: '#15171a',
										display: 'flex',
										fontSize: 22,
										height: 58,
										padding: '0 18px',
									}}
								>
									Square · 1080p
								</div>
							</div>
						</div>
						<div style={{display: 'flex', gap: 18}}>
							<div
								style={{
									display: 'flex',
									flex: 1,
									flexDirection: 'column',
									gap: 10,
								}}
							>
								<div style={{color: '#6b7280', fontSize: 18, fontWeight: 500}}>
									Call to action
								</div>
								<div
									style={{
										alignItems: 'center',
										backgroundColor: '#f8fafc',
										border: '2px solid #d9dee7',
										borderRadius: 12,
										color: '#15171a',
										display: 'flex',
										fontSize: 22,
										height: 58,
										padding: '0 18px',
									}}
								>
									Shop now
								</div>
							</div>
							<div
								style={{
									display: 'flex',
									flex: 1,
									flexDirection: 'column',
									gap: 10,
								}}
							>
								<div style={{color: '#6b7280', fontSize: 18, fontWeight: 500}}>
									Brand color
								</div>
								<div
									style={{
										alignItems: 'center',
										display: 'flex',
										gap: 12,
										height: 58,
									}}
								>
									<div
										style={{
											backgroundColor: '#0b84f3',
											border: '5px solid white',
											borderRadius: '50%',
											height: 38,
											width: 38,
										}}
									/>
									<div
										style={{
											backgroundColor: '#fd4b61',
											border: '2px solid #d9dee7',
											borderRadius: '50%',
											height: 38,
											width: 38,
										}}
									/>
									<div
										style={{
											backgroundColor: '#f6c945',
											border: '2px solid #d9dee7',
											borderRadius: '50%',
											height: 38,
											width: 38,
										}}
									/>
									<div
										style={{
											backgroundColor: '#111827',
											border: '2px solid #d9dee7',
											borderRadius: '50%',
											height: 38,
											width: 38,
										}}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</ExtrudeDiv>
		</AbsoluteFill>
	);
}
