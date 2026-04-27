import React from 'react';
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
					position: 'absolute',
					left: '50%',
					top: '50%',
					textAlign: 'center',
					padding: 40,
					userSelect: 'none',
					touchAction: 'none',
					border: 'none',
					boxShadow: 'none',
					zIndex: 10,
					borderRadius: 4,
					fontSize: 21,
					overflowWrap: 'break-word',
					wordBreak: 'break-word',
					lineHeight: 0.9,
					transform: 'translate3d(-50%, -50%, 0px)',
					display: 'flex',
					placeItems: 'center',
					justifyContent: 'center',
				}}
			>
				<div
					id="video-player-container"
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						pointerEvents: 'none',
					}}
				>
					<div
						style={{
							direction: 'ltr',
							left: '50%',
							top: '50%',
						}}
					>
						<div
							id="word-wrapper"
							style={{
								display: 'flex',
								whiteSpace: 'nowrap',
								flexDirection: 'column',
								filter:
									'drop-shadow(rgb(255, 255, 255) 0px 0px 100px) drop-shadow(rgba(0, 0, 0, 0.35) 5px 5px 15px)',
							}}
						>
							<div
								style={{
									width: '100%',
									position: 'relative',
									textAlign: 'center',
								}}
							>
								<div
									data-line-id="9"
									data-line-active="true"
									style={{
										display: 'block',
										position: 'relative',
										fontFamily: 'sans-serif',
										fontSize: 32,
										lineHeight: 0.9,
										color: 'rgb(255, 255, 255)',
										textAlign: 'center',
										textShadow: 'rgba(0, 0, 0, 0.35) 5px 5px 15px',
										height: 'unset',
										opacity: 1,
									}}
								>
									<span
										style={{
											position: 'relative',
											display: 'inline-block',
											whiteSpace: 'pre',
										}}
									>
										<span
											aria-hidden="true"
											style={{
												position: 'absolute',
												top: '50%',
												left: '50%',
												width: '120%',
												height: '80%',
												transform: 'translate(-50%, -50%)',
												filter: 'blur(10px)',
												pointerEvents: 'none',
												zIndex: 0,
											}}
										/>
										<span
											data-word-id="19"
											style={{
												fontFamily: 'sans-serif',
												fontSize: 63,
												color: 'rgb(255, 255, 255)',
												display: 'inline-block',
												textAlign: 'center',
												textShadow: 'none',
												fontWeight: 800,
												lineHeight: 0.9,
												filter: 'drop-shadow(rgba(0, 0, 0, 0.35) 5px 5px 15px)',
												opacity: 1,
												whiteSpace: 'pre',
											}}
										>
											announced by
										</span>
									</span>
									<span
										style={{
											position: 'relative',
											display: 'inline-block',
											whiteSpace: 'pre',
										}}
									>
										<span
											aria-hidden="true"
											style={{
												position: 'absolute',
												top: '50%',
												left: '50%',
												width: '120%',
												height: '80%',
												transform: 'translate(-50%, -50%)',
												filter: 'blur(10px)',
												pointerEvents: 'none',
												zIndex: 0,
											}}
										/>
										<span
											data-word-id="-1"
											style={{
												fontFamily: 'sans-serif',
												fontSize: 63,
												color: 'rgb(255, 255, 255)',
												display: 'inline-block',
												textAlign: 'center',
												textShadow: 'none',
												fontWeight: 800,
												lineHeight: 0.9,
												filter: 'drop-shadow(rgba(0, 0, 0, 0.35) 5px 5px 15px)',
												opacity: 1,
												whiteSpace: 'pre',
											}}
										>
											{' '}
										</span>
									</span>
									<span
										style={{
											position: 'relative',
											display: 'inline-block',
											whiteSpace: 'pre',
										}}
									>
										<span
											aria-hidden="true"
											style={{
												position: 'absolute',
												top: '50%',
												left: '50%',
												width: '120%',
												height: '80%',
												transform: 'translate(-50%, -50%)',
												filter: 'blur(10px)',
												pointerEvents: 'none',
												zIndex: 0,
											}}
										/>
										<span
											data-word-id="20"
											style={{
												fontFamily: 'sans-serif',
												fontSize: 63,
												color: 'rgb(255, 255, 255)',
												display: 'inline-block',
												textAlign: 'center',
												textShadow: 'none',
												fontWeight: 800,
												lineHeight: 0.9,
												filter: 'drop-shadow(rgba(0, 0, 0, 0.35) 5px 5px 15px)',
												opacity: 1,
												whiteSpace: 'pre',
											}}
										>
											a
										</span>
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const filterLineHeightClip = {
	component: Component,
	id: 'filter-line-height-clip',
	width: 800,
	height: 400,
	fps: 25,
	durationInFrames: 1,
} as const;
