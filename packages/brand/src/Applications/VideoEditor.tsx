import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ExtrudeDiv} from '../3DContext/Div3D';
import {KineticType} from './KineticType';

export function ApplicationVideoEditor({
	kineticTypeFrame,
}: {
	readonly kineticTypeFrame?: number;
}) {
	const frame = useCurrentFrame();
	const titleFrame = kineticTypeFrame ?? frame;

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
				depth={120}
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
										backgroundColor: '#b9dff4',
										display: 'flex',
										height: 292,
										justifyContent: 'center',
										overflow: 'hidden',
										position: 'relative',
										scale: 1.3,
										width: 292,
									}}
								>
									<div
										style={{
											backgroundColor: '#f3f4f6',
											backgroundImage:
												'conic-gradient(#d1d5db 25%, transparent 0 50%, #d1d5db 0 75%, transparent 0)',
											backgroundSize: '32px 32px',
											inset: 0,
											position: 'absolute',
										}}
									/>
									<div
										style={{
											bottom: 32,
											color: '#374151',
											fontSize: 30,
											fontWeight: 700,
											left: 25,
											letterSpacing: -1.2,
											lineHeight: 0.88,
											position: 'absolute',
										}}
									>
										<KineticType frame={titleFrame * 1.5} />
										<div
											style={{
												border: '2px solid #0b84f3',
												inset: -10,
												position: 'absolute',
											}}
										>
											{[
												{key: 'top-left', left: -5, top: -5},
												{key: 'top-right', right: -5, top: -5},
												{bottom: -5, key: 'bottom-left', left: -5},
												{bottom: -5, key: 'bottom-right', right: -5},
											].map(({key, ...position}) => (
												<div
													key={key}
													style={{
														backgroundColor: 'white',
														border: '2px solid #0b84f3',
														height: 9,
														position: 'absolute',
														width: 9,
														...position,
													}}
												/>
											))}
										</div>
									</div>
								</div>
							</div>
							<div
								style={{
									backgroundColor: '#1b1e23',
									borderTop: '2px solid #2b2f36',
									height: 120,
									position: 'relative',
								}}
							>
								<div
									style={{
										bottom: 12,
										display: 'flex',
										flexDirection: 'column',
										gap: 8,
										height: 85,
										left: 18,
										position: 'absolute',
										right: 18,
									}}
								>
									<div
										style={{
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
												left: '18%',
												opacity: 0.9,
												position: 'absolute',
												width: '55%',
											}}
										/>
									</div>
									<div
										style={{
											bottom: 0,
											left: `${interpolate(titleFrame, [0, 65], [5, 82], {
												extrapolateLeft: 'clamp',
												extrapolateRight: 'clamp',
											})}%`,
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
									borderRadius: 8,
									padding: '12px 0',
								}}
							>
								<div
									style={{
										backgroundColor: '#d1d5db',
										borderRadius: 999,
										height: 9,
										opacity: 0.35,
										width: '68%',
									}}
								/>
							</div>
							<div
								style={{
									borderRadius: 0,
									padding: '12px 0',
								}}
							>
								<div
									style={{
										backgroundColor: '#d1d5db',
										borderRadius: 999,
										height: 9,
										opacity: 0.3,
										width: '82%',
									}}
								/>
							</div>
							<div
								style={{
									borderRadius: 0,
									padding: '12px 0',
								}}
							>
								<div
									style={{
										backgroundColor: '#d1d5db',
										borderRadius: 999,
										height: 9,
										opacity: 0.3,
										width: '54%',
									}}
								/>
							</div>
							<div
								style={{
									borderRadius: 0,
									padding: '12px 0',
								}}
							>
								<div
									style={{
										backgroundColor: '#d1d5db',
										borderRadius: 999,
										height: 9,
										opacity: 0.3,
										width: '72%',
									}}
								/>
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
										height: 14,
										padding: '9px 7px',
									}}
								/>
								<div
									style={{
										backgroundColor: '#252930',
										borderRadius: 7,
										height: 14,
										padding: '9px 7px',
									}}
								/>
								<div
									style={{
										backgroundColor: '#252930',
										borderRadius: 7,
										height: 14,
										padding: '9px 7px',
									}}
								/>
								<div
									style={{
										backgroundColor: '#252930',
										borderRadius: 7,
										height: 14,
										padding: '9px 7px',
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			</ExtrudeDiv>
		</AbsoluteFill>
	);
}
