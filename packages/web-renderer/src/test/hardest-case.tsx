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
					background: 'rgb(250, 250, 250)',
				}}
			>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						width: '100%',
						height: '100%',
						display: 'flex',
						opacity: 1,
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
								width: 1080,
								height: 1080,
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
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
									transform: 'scale(0.7)',
									overflow: 'hidden',
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
											maskImage: 'linear-gradient(black 58%, transparent 74%)',
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
												overflow: 'visible',
												color: 'black',
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
													transform: 'rotate(-0.0008334rad)',
													transformOrigin: '150% 50%',
												}}
											>
												<svg
													width={1080}
													height={1080}
													viewBox="0 0 1080 1080"
													fill="none"
												>
													<path
														d="M299 577.067V535.329C299 516.558 314.216 501.342 332.987 501.342V501.342"
														stroke="currentColor"
														strokeWidth="27.4281"
														strokeLinecap="square"
													/>
												</svg>
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
											transformOrigin: 'center center',
											transform:
												'scale(0.68) translateX(-539.98px) translateY(0.111718px)',
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
													justifyContent: 'center',
													alignItems: 'center',
													scale: '1.2754',
												}}
											>
												<svg
													width={104.4}
													height={104.4}
													viewBox={`0 0 104.39999999999999 104.39999999999999`}
													xmlns="http://www.w3.org/2000/svg"
													style={{
														overflow: 'visible',
														marginLeft: -2.1325,
													}}
												>
													<path
														// Note: transform-origin is not a valid SVG attribute, ignoring it in JSX
														d="M 52.199999999999996 0 C 88.02637538443085 0 104.39999999999999 16.37362461556915 104.39999999999999 52.199999999999996 C 104.39999999999999 88.02637538443085 88.02637538443085 104.39999999999999 52.199999999999996 104.39999999999999 C 16.37362461556915 104.39999999999999 0 88.02637538443085 0 52.199999999999996 C 0 16.37362461556915 16.37362461556915 0 52.199999999999996 0 Z"
														fill="rgba(241, 60, 3, 1)"
														style={{
															transformBox: 'fill-box',
															transformOrigin:
																'52.199999999999996 52.199999999999996',
														}}
													/>
												</svg>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export const hardestCase = {
	component: Component,
	id: 'hardest-case',
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 100,
} as const;
