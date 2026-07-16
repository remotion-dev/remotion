import {AbsoluteFill} from 'remotion';
import {ExtrudeDiv} from '../3DContext/Div3D';
export function ApplicationVideoEditor() {
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
				scaleX={1.08}
				scaleY={1.08}
				scaleZ={1.08}
				topFace={
					<div
						style={{
							backgroundColor: '#262a31',
							height: '100%',
							width: '100%',
						}}
					/>
				}
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
						height: '100%',
						overflow: 'hidden',
						width: '100%',
					}}
				>
					<div
						style={{
							alignItems: 'center',
							backgroundColor: '#1d2026',
							borderBottom: '2px solid #2b2f36',
							display: 'flex',
							height: 66,
							justifyContent: 'space-between',
							padding: '0 20px',
						}}
					>
						<div style={{alignItems: 'center', display: 'flex', gap: 12}}>
							<div
								style={{
									backgroundColor: '#0b84f3',
									borderRadius: 9,
									height: 34,
									rotate: '45deg',
									width: 34,
								}}
							/>
							<div style={{fontSize: 20, fontWeight: 500}}>
								Untitled project
							</div>
						</div>
						<div style={{alignItems: 'center', display: 'flex', gap: 10}}>
							<div
								style={{
									alignItems: 'center',
									backgroundColor: '#2a2d33',
									borderRadius: 9,
									color: '#f5f7fa',
									display: 'flex',
									fontSize: 16,
									height: 38,
									justifyContent: 'center',
									width: 38,
								}}
							>
								↶
							</div>
							<div
								style={{
									alignItems: 'center',
									backgroundColor: '#2a2d33',
									borderRadius: 9,
									color: '#f5f7fa',
									display: 'flex',
									fontSize: 16,
									height: 38,
									justifyContent: 'center',
									width: 38,
								}}
							>
								↷
							</div>
							<div
								style={{
									backgroundColor: '#292d34',
									borderRadius: 9,
									fontSize: 16,
									padding: '10px 16px',
								}}
							>
								1080 × 1080
							</div>
						</div>
					</div>
					<div style={{display: 'flex', flex: 1, minHeight: 0}}>
						<div
							style={{
								backgroundColor: '#1b1e23',
								borderRight: '2px solid #2b2f36',
								display: 'flex',
								flexDirection: 'column',
								gap: 14,
								padding: 18,
								width: 180,
							}}
						>
							<div style={{fontSize: 17, fontWeight: 500}}>Assets</div>
							<div
								style={{
									backgroundColor: '#252930',
									borderRadius: 8,
									color: '#8f96a3',
									fontSize: 14,
									padding: '10px 12px',
								}}
							>
								Search media
							</div>
							<div
								style={{
									display: 'grid',
									gap: 10,
									gridTemplateColumns: '1fr 1fr',
								}}
							>
								<div
									style={{
										background: 'linear-gradient(145deg, #0b84f3, #15171b)',
										border: '2px solid #363b45',
										borderRadius: 9,
										height: 82,
									}}
								/>
								<div
									style={{
										background: 'linear-gradient(145deg, #f7c948, #15171b)',
										border: '2px solid #363b45',
										borderRadius: 9,
										height: 82,
									}}
								/>
								<div
									style={{
										background: 'linear-gradient(145deg, #fd4b61, #15171b)',
										border: '2px solid #363b45',
										borderRadius: 9,
										height: 62,
									}}
								/>
								<div
									style={{
										background: 'linear-gradient(145deg, #8b5cf6, #15171b)',
										border: '2px solid #363b45',
										borderRadius: 9,
										height: 62,
									}}
								/>
							</div>
							<div style={{fontSize: 14, color: '#8f96a3'}}>Audio</div>
							<div
								style={{
									alignItems: 'center',
									backgroundColor: '#252930',
									borderRadius: 9,
									display: 'flex',
									gap: 8,
									height: 50,
									padding: '0 10px',
								}}
							>
								<div
									style={{
										backgroundColor: '#9aa1ad',
										borderRadius: 2,
										height: 12,
										width: 5,
									}}
								/>
								<div
									style={{
										backgroundColor: '#9aa1ad',
										borderRadius: 2,
										height: 24,
										width: 5,
									}}
								/>
								<div
									style={{
										backgroundColor: '#9aa1ad',
										borderRadius: 2,
										height: 18,
										width: 5,
									}}
								/>
								<div
									style={{
										backgroundColor: '#9aa1ad',
										borderRadius: 2,
										height: 30,
										width: 5,
									}}
								/>
								<div
									style={{
										backgroundColor: '#9aa1ad',
										borderRadius: 2,
										height: 16,
										width: 5,
									}}
								/>
								<div
									style={{
										backgroundColor: '#9aa1ad',
										borderRadius: 2,
										height: 26,
										width: 5,
									}}
								/>
								<div
									style={{
										backgroundColor: '#9aa1ad',
										borderRadius: 2,
										height: 10,
										width: 5,
									}}
								/>
							</div>
						</div>
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
									>
										Make it
										<br /> memorable.
									</div>
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
											backgroundColor: '#0b84f3',
											borderRadius: 9,
											color: '#f5f7fa',
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
									<div style={{color: '#8f96a3', fontSize: 14}}>Fit · 100%</div>
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
										<div
											style={{
												backgroundColor: '#ff4b55',
												bottom: -62,
												left: '48%',
												position: 'absolute',
												top: -7,
												width: 2,
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
							<div style={{fontSize: 17, fontWeight: 500}}>Inspector</div>
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
