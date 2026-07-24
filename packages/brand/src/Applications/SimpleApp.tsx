import {
	AbsoluteFill,
	Easing,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {ExtrudeDiv} from '../3DContext/Div3D';

export function ApplicationSimpleApp() {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
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
				height={590}
				name="Simple application"
				rotationX={-Math.PI / 24}
				rotationY={-Math.PI / 30}
				rotationZ={0.01}
				width={820}
				style={{
					translate: '-3.9px 60.7px',
				}}
			>
				<div
					style={{
						backgroundColor: '#ffffff',
						border: '4px solid #111111',
						borderRadius: 30,
						fontFamily: 'GT Planar, sans-serif',
						fontFeatureSettings: "'ss03'",
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
								backgroundColor: '#111827',
								borderRadius: 18,
								display: 'flex',
								height: 332,
								justifyContent: 'center',
								overflow: 'hidden',
								position: 'relative',
							}}
						>
							<svg
								fill="none"
								height={164}
								viewBox="0 0 389 402"
								width={159}
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M87.6061 0.0346985C79.1878 0.491638 72.4039 1.82733 65.5673 4.42841C62.1578 5.71136 56.569 8.5058 53.4934 10.439C40.6286 18.5059 30.8219 30.6325 25.7076 44.7451C24.6882 47.5395 21.929 56.4499 20.1539 62.5835C8.32607 103.586 1.61249 148.419 0.171355 195.871C-0.0571182 203.428 -0.0571182 221.425 0.171355 228.859C1.13797 260.318 4.14327 288.719 9.59146 317.682C11.8059 329.405 15.356 345.152 17.4123 352.305C21.6126 366.839 30.1892 379.212 42.3861 388.28C50.5584 394.361 59.8379 398.438 70.1192 400.442C75.0753 401.409 81.6131 401.848 86.4286 401.532C93.0895 401.092 106.306 399.317 117.044 397.402C165.445 388.772 210.155 373.324 250.701 351.215C276.377 337.208 298.328 322.041 319.506 303.64C340.613 285.327 358.61 265.626 374.445 243.516C378.118 238.402 379.963 235.414 381.809 231.653C386.554 221.952 388.786 212.304 388.768 201.513C388.768 191.46 386.87 182.532 382.775 173.393C380.807 168.982 378.926 165.818 374.708 159.807C359.172 137.681 341.931 118.401 320.912 99.6664C288.328 70.6328 249.628 46.8189 206.412 29.1913C197.045 25.3776 187.818 22.0208 176.711 18.3828C153.195 10.7026 124.091 4.04178 99.4691 0.720123C95.6027 0.192871 90.3478 -0.105896 87.6061 0.0346985Z"
									fill="#0B84F3"
								/>
							</svg>
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
											backgroundColor: 'white',
											borderRadius: 5,
											height: '100%',
											width: interpolate(
												frame,
												[0, durationInFrames - 1],
												['0%', '100%'],
												{
													easing: Easing.linear,
													extrapolateLeft: 'clamp',
													extrapolateRight: 'clamp',
												},
											),
										}}
									/>
								</div>
								<div style={{color: 'white', fontSize: 17}}>0:12 / 0:30</div>
							</div>
						</div>
						<div>
							<div
								style={{
									display: 'flex',
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
						</div>
					</div>
				</div>
			</ExtrudeDiv>
		</AbsoluteFill>
	);
}
