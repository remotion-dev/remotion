import {AbsoluteFill} from 'remotion';
import {ExtrudeDiv} from '../3DContext/Div3D';
export function ApplicationVideoEditor() {
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
							backgroundColor: '#090a0d',
							border: '4px solid #050506',
							borderRadius: 30,
							height: '100%',
							width: '100%',
						}}
					/>
				}
				cornerRadius={30}
				depth={46}
				height={724}
				name="Video editor"
				rotationX={-Math.PI / 24}
				rotationY={-Math.PI / 30}
				rotationZ={0.01}
				width={940}
			>
				<div
					style={{
						backgroundColor: '#16181d',
						border: '4px solid #050506',
						borderRadius: 30,
						color: '#e5e7eb',
						display: 'flex',
						flexDirection: 'column',
						fontFamily: 'GT Planar, sans-serif',
						fontFeatureSettings: "'ss03'",
						height: '100%',
						overflow: 'hidden',
						width: '100%',
					}}
				>
					<div style={{display: 'flex', flex: 1, minHeight: 0}}>
						<div style={{display: 'flex', flex: 1, flexDirection: 'column'}}>
							<div
								style={{
									alignItems: 'center',
									backgroundColor: '#101216',
									display: 'flex',
									flex: 1,
									justifyContent: 'center',
									minHeight: 0,
								}}
							>
								<div
									style={{
										alignItems: 'center',
										background:
											'linear-gradient(145deg, #071526 0%, #0b84f3 130%)',
										display: 'flex',
										height: 292,
										justifyContent: 'center',
										position: 'relative',
										width: 292,
									}}
								>
									<div
										style={{
											color: 'white',
											fontSize: 40,
											fontWeight: 500,
											lineHeight: 1.05,
											textAlign: 'center',
										}}
									/>
									<div
										style={{
											border: '2px solid #0b84f3',
											inset: 46,
											position: 'absolute',
										}}
									/>
								</div>
							</div>
							<div
								style={{
									backgroundColor: '#1b1e23',
									borderTop: '2px solid #2b2f36',
									height: 190,
									padding: '14px 18px 12px',
									position: 'relative',
								}}
							>
								<div style={{alignItems: 'center', display: 'flex', gap: 10}}>
									<div
										style={{
											alignItems: 'center',
											borderRadius: 9,
											color: '#8f96a3',
											display: 'flex',
											fontSize: 16,
											height: 38,
											justifyContent: 'center',
											width: 38,
										}}
									>
										▶
									</div>
									<div style={{color: '#8f96a3', fontSize: 14}}>00:04:12</div>
									<div style={{flex: 1}} />
								</div>
								<div
									style={{
										bottom: 12,
										display: 'flex',
										flexDirection: 'column',
										gap: 8,
										left: 18,
										position: 'absolute',
										right: 18,
									}}
								>
									<div
										style={{
											backgroundColor: '#252930',
											borderRadius: 5,
											height: 23,
											position: 'relative',
										}}
									>
										<div
											style={{
												backgroundColor: '#0b84f3',
												borderRadius: 4,
												height: '100%',
												left: '5%',
												opacity: 0.9,
												position: 'absolute',
												width: '72%',
											}}
										/>
									</div>
									<div
										style={{
											backgroundColor: '#252930',
											borderRadius: 5,
											height: 23,
											position: 'relative',
										}}
									>
										<div
											style={{
												backgroundColor: '#8b5cf6',
												borderRadius: 4,
												height: '100%',
												left: '18%',
												opacity: 0.9,
												position: 'absolute',
												width: '55%',
											}}
										/>
									</div>
									<div
										style={{
											backgroundColor: '#252930',
											borderRadius: 5,
											height: 23,
											position: 'relative',
										}}
									>
										<div
											style={{
												backgroundColor: '#2fbf71',
												borderRadius: 4,
												height: '100%',
												left: '0%',
												opacity: 0.9,
												position: 'absolute',
												width: '84%',
											}}
										/>
									</div>
									<div
										style={{
											bottom: 0,
											left: '48%',
											pointerEvents: 'none',
											position: 'absolute',
											top: -7,
											width: 1,
											zIndex: 1,
										}}
									>
										<div
											style={{
												backgroundColor: '#f02c00',
												height: '100%',
												width: 1,
											}}
										/>
										<div
											style={{
												height: 20,
												left: -8,
												position: 'absolute',
												top: 0,
												width: 20,
											}}
										>
											<svg width={17} viewBox="0 0 159 212">
												<path
													d="M17.0234375,1.07763419 L143.355469,1.07763419 C151.63974,1.07763419 158.355469,7.79336295 158.355469,16.0776342 L158.355469,69.390507 C158.355469,73.7938677 156.420655,77.9748242 153.064021,80.8248415 L89.3980057,134.881757 C83.7986799,139.635978 75.5802263,139.635978 69.9809005,134.881757 L6.66764807,81.1243622 C3.0872392,78.0843437 1.0234375,73.6246568 1.0234375,68.9277387 L1.0234375,17.0776342 C1.0234375,8.2410782 8.1868815,1.07763419 17.0234375,1.07763419 Z"
													fill="#f02c00"
												/>
											</svg>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div
							style={{
								backgroundColor: '#1b1e23',
								borderLeft: '2px solid #2b2f36',
								display: 'flex',
								flexDirection: 'column',
								gap: 14,
								padding: 18,
								width: 180,
							}}
						>
							<div
								style={{
									backgroundColor: '#252930',
									borderBottom: '1px solid #343942',
									borderRadius: 8,
									color: '#f4f6f8',
									fontSize: 15,
									padding: '12px 10px',
								}}
							>
								Position
							</div>
							<div
								style={{
									borderBottom: '1px solid #343942',
									borderRadius: 0,
									color: '#a6adb8',
									fontSize: 15,
									padding: '12px 10px',
								}}
							>
								Typography
							</div>
							<div
								style={{
									borderBottom: '1px solid #343942',
									borderRadius: 0,
									color: '#a6adb8',
									fontSize: 15,
									padding: '12px 10px',
								}}
							>
								Effects
							</div>
							<div
								style={{
									borderBottom: '1px solid #343942',
									borderRadius: 0,
									color: '#a6adb8',
									fontSize: 15,
									padding: '12px 10px',
								}}
							>
								Animation
							</div>
							<div
								style={{
									display: 'grid',
									gap: 8,
									gridTemplateColumns: '1fr 1fr',
								}}
							>
								<div
									style={{
										backgroundColor: '#252930',
										borderRadius: 7,
										color: '#a6adb8',
										fontSize: 12,
										padding: '9px 7px',
									}}
								>
									X 312
								</div>
								<div
									style={{
										backgroundColor: '#252930',
										borderRadius: 7,
										color: '#a6adb8',
										fontSize: 12,
										padding: '9px 7px',
									}}
								>
									Y 148
								</div>
								<div
									style={{
										backgroundColor: '#252930',
										borderRadius: 7,
										color: '#a6adb8',
										fontSize: 12,
										padding: '9px 7px',
									}}
								>
									W 456
								</div>
								<div
									style={{
										backgroundColor: '#252930',
										borderRadius: 7,
										color: '#a6adb8',
										fontSize: 12,
										padding: '9px 7px',
									}}
								>
									H 128
								</div>
							</div>
						</div>
					</div>
				</div>
			</ExtrudeDiv>
		</AbsoluteFill>
	);
}
