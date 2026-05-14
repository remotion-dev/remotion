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
					transform: 'translate3d(0, 0, 0)',
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
								flexDirection: 'column',
								filter:
									'drop-shadow(rgb(160, 216, 62) 0px 0px 100px) drop-shadow(rgba(0, 0, 0, 0.35) 5px 5px 15px)',
							}}
						>
							{/* First line: "just by" */}
							<div
								style={{
									textAlign: 'left',
									whiteSpace: 'nowrap',
									width: '100%',
									position: 'relative',
									overflow: 'visible',
								}}
							>
								<div
									data-line-id="2"
									data-line-active="false"
									style={{
										display: 'block',
										position: 'relative',
										fontFamily: 'sans-serif',
										fontSize: 32,
										lineHeight: 0.9,
										color: 'rgb(255, 255, 255)',
										textAlign: 'left',
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
											data-word-id="6"
											style={{
												fontFamily: 'sans-serif',
												fontSize: 63,
												color: 'rgb(255, 255, 255)',
												display: 'inline-block',
												textAlign: 'left',
												textShadow: 'none',
												fontWeight: 800,
												lineHeight: 0.9,
												filter: 'drop-shadow(rgba(0, 0, 0, 0.35) 5px 5px 15px)',
												opacity: 1,
												whiteSpace: 'pre',
											}}
										>
											just
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
												textAlign: 'left',
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
											data-word-id="7"
											style={{
												fontFamily: 'sans-serif',
												fontSize: 63,
												color: 'rgb(255, 255, 255)',
												display: 'inline-block',
												textAlign: 'left',
												textShadow: 'none',
												fontWeight: 800,
												lineHeight: 0.9,
												filter: 'drop-shadow(rgba(0, 0, 0, 0.35) 5px 5px 15px)',
												opacity: 1,
												whiteSpace: 'pre',
											}}
										>
											by
										</span>
									</span>
								</div>
							</div>
							{/* Second line: "ordering" with gradient */}
							<div
								style={{
									textAlign: 'center',
									width: '100%',
									position: 'relative',
									overflow: 'visible',
									marginTop: -12,
									zIndex: 101,
								}}
							>
								<div
									data-line-id="3"
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
												width: '150%',
												height: '100%',
												transform: 'translate(-50%, -50%)',
												filter: 'blur(15px)',
												pointerEvents: 'none',
												zIndex: 0,
											}}
										/>
										<span
											data-word-id="8"
											style={{
												fontFamily: 'sans-serif',
												fontSize: 137.812,
												color: 'rgb(160, 216, 62)',
												display: 'inline-block',
												textAlign: 'center',
												textShadow: 'none',
												backgroundClip: 'text',
												WebkitTextFillColor: 'transparent',
												fontWeight: 900,
												lineHeight: 0.9,
												filter: 'drop-shadow(rgba(0, 0, 0, 0.35) 5px 5px 15px)',
												textTransform: 'uppercase',
												opacity: 1,
												backgroundImage:
													'linear-gradient(90deg, rgb(160, 216, 62) 0%, rgb(160, 216, 62) 20%, rgb(170, 220, 83) 40%, rgb(202, 233, 147) 50%, rgb(170, 220, 83) 70%, rgb(160, 216, 62) 80%, rgb(160, 216, 62) 100%)',
												whiteSpace: 'pre',
											}}
										>
											ordering
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

export const issue7050Repro = {
	component: Component,
	id: 'issue-7050-repro',
	width: 800,
	height: 400,
	fps: 25,
	durationInFrames: 1,
} as const;
