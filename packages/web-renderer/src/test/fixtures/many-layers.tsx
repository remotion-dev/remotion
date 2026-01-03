export const Component: React.FC = () => {
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
					backgroundColor: 'rgb(6, 8, 66)',
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
								width: 256,
								height: 284,
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<svg
								viewBox="0 0 1080 1080"
								width={1080}
								height={1080}
								fill="none"
							>
								<path
									d="M358.7 792.3C359.4 787.4 361.9 783.3 364.1 779.1C380.3 748.2 388.3 714.9 393.6 680.7C394.7 673.3 395.9 665.9 396.7 658.5C397.1 655.1 399.1 653.4 401.6 652.1C444.7 628.3 487.8 604.7 530.9 581C531.3 580.8 531.7 580.8 532.7 580.6C530.7 586.7 528.7 592.5 526.9 598.3C515.9 633.2 509.1 669.2 499.7 704.5C497.3 713.6 494.3 722.7 492 731.8C491.3 734.6 489.4 735.4 487.2 736.2C469.2 742.7 451.1 748.7 433.3 755.7C413 763.7 393.3 772.9 374.1 783C368.6 785.7 363.7 789.1 358.7 792.3Z"
									fill="#9EB7DD"
								/>
								<path
									d="M573.4 585.5C585.7 593.3 598.1 601.1 610.4 608.9C631.7 622.5 653 636.1 674.3 649.7C680.9 653.9 686.8 659 693 663.9C694.8 665.3 695.1 667.2 695.2 669.2C697.9 709.7 706.1 749.1 718.4 787.7C720.2 793.3 722.2 798.9 723.5 805C720.4 802.2 717.2 799.4 714.1 796.6C689.4 774.3 662.5 755.2 632.4 740.8C624.8 737.1 617.1 733.5 608.5 732.4C606 732.1 605.5 730.3 605.2 728.1C599.8 688.7 590.3 650.1 580.3 611.7C578.6 605.1 577.1 598.5 574.6 592.1C573.8 590.1 572.7 587.8 573.4 585.4V585.5Z"
									fill="#9EB7DD"
								/>
								<path
									d="M596 536.5C596.5 533.9 598.6 533.3 600.1 532.2C639.3 505.8 679.1 480.4 717.7 453.1C720.3 451.3 722.7 451 725.7 451.8C757.8 461.1 790.7 465.5 823.9 467.6C832.2 468.1 840.5 468.8 848.8 468.5C849.7 468.5 851 468.1 851.4 469.3C851.9 470.9 850.3 471.1 849.4 471.6C844.9 474.4 840.3 477.2 835.6 479.7C805.9 495.8 779 515.9 753.4 537.7C747.6 542.7 741.6 547.4 735.3 551.8C733.4 553.1 731.5 553.5 729.2 553.1C708.8 549.3 688.1 547 667.5 544.5C648.9 542.2 630.2 540.2 611.6 537.9C606.6 537.3 601.2 538 596 536.5Z"
									fill="#9EB7DD"
								/>
								<path
									d="M542.9 241.4C544.6 250.7 547.1 258.7 550 266.6C559.1 291.5 570 315.5 582.1 339C587.4 349.2 592.2 359.6 596.9 370C598.9 374.5 599.2 378.2 597.2 383.1C586.7 409.1 576.7 435.4 566.4 461.5C562.1 472.5 557.6 483.4 553.1 494.3C552.4 495.9 552.2 498.4 550.1 498.5C547.9 498.6 547.9 496 547.2 494.4C532.5 463.3 520.9 430.8 504.4 400.5C501.6 395.4 499.1 390.2 496.3 385.1C495.3 383.2 495.2 381.4 496.3 379.5C517.5 339.9 531.4 297.8 539.5 253.7C540.2 250.1 541 246.6 541.8 243C541.8 242.8 541.9 242.7 542.9 241.4Z"
									fill="#9EB7DD"
								/>
								<path
									d="M263.3 476.1C272.4 476.5 281.3 477.1 290.3 476.7C322.4 475.4 353.5 468.6 384.1 458.9C390.5 456.9 395.6 457.4 401.3 461.1C439.1 485.6 477.9 508.6 516.3 532.3C516.9 532.6 517.5 532.9 518 533.3C519 534.1 520.7 534.6 520.3 536.2C519.9 537.7 518.3 537.6 516.9 537.7C513.1 537.9 509.3 538.2 505.4 538.4C478.5 539.6 451.6 541.5 424.8 544.6C410.7 546.2 396.9 548.8 383.1 552.1C379.1 553.1 376.3 552.2 373.3 549.3C346.6 523.6 315.6 503.9 282.9 486.9C276.4 483.3 269.8 479.9 263.3 476.1Z"
									fill="#9EB7DD"
								/>
							</svg>
						</div>
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
									transform: 'translateY(666.855px)',
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
											transformOrigin: 'left bottom',
											transform:
												'scale(0.800175) rotateY(-0.0130881deg) rotateX(0.00872538deg) skewX(-0.00610777deg) skewY(0.00349015deg) scale(1.00102) translateX(-0.436269px) translateY(0.218135px)',
										}}
									/>
								</div>
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
											left: '349.695px',
											top: '479.581px',
											position: 'absolute',
											display: 'flex',
											flexDirection: 'column',
											transform:
												'perspective(1200px) rotateY(14.9869deg) rotateX(-9.99127deg) skewX(6.99389deg) skewY(-3.99651deg) scale(0.400524)',
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
												<div style={{position: 'relative'}}>
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
																height: '100%',
																width: '100%',
																zIndex: -1,
																opacity: 1,
															}}
														/>
													</div>
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
																height: '100%',
																width: '100%',
																display: 'flex',
																justifyContent: 'center',
																alignItems: 'center',
																zIndex: -1,
															}}
														/>
													</div>
													<div
														style={{
															padding: 20,
															backgroundColor: 'rgba(255, 255, 255, 0.1)',
															border: '1px solid rgba(255, 255, 255, 0.2)',
															borderRadius: 70,
														}}
													>
														<div
															style={{
																marginTop: 0,
																marginLeft: 0,
																marginRight: 0,
																display: 'flex',
																backgroundColor: 'rgba(230, 225, 252, 0.8)',
																height: 200,
																flexDirection: 'row',
																alignItems: 'center',
																paddingLeft: 50,
																borderRadius: 50,
																position: 'relative',
																overflow: 'hidden',
																border: '2px solid rgba(255, 255, 255, 0.1)',
															}}
														>
															<div
																style={{
																	color: 'rgb(1, 6, 74)',
																	fontWeight: 'bold',
																	fontSize: 45,
																	fontFamily: 'sans-serif',
																}}
															>
																Most productive day
															</div>
															<div
																style={{
																	position: 'absolute',
																	right: 0,
																	height: '100%',
																	width: 400,
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
																			backgroundImage:
																				'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.125) 100%)',
																		}}
																	/>
																</div>
																<div
																	style={{
																		position: 'absolute',
																		inset: 0,
																		width: '100%',
																		height: '100%',
																		display: 'flex',
																		flexDirection: 'column',
																		maskImage:
																			'linear-gradient(transparent 0%, rgb(0, 0, 0) 30%, rgb(0, 0, 0) 70%, transparent 100%)',
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
																			perspective: 10000,
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
																		/>
																		<div
																			style={{
																				position: 'absolute',
																				inset: 0,
																				width: '100%',
																				height: '100%',
																				display: 'flex',
																				flexDirection: 'column',
																				justifyContent: 'center',
																				fontSize: 65,
																				transform:
																					'translateZ(130px) translateY(0px) rotateX(0deg)',
																				backfaceVisibility: 'hidden',
																				perspective: 1000,
																				color: 'rgb(1, 6, 74)',
																				fontFamily: 'sans-serif',
																				fontWeight: 'bold',
																			}}
																		>
																			<div
																				style={{
																					transform: 'rotateX(0rad)',
																					backfaceVisibility: 'hidden',
																					textAlign: 'right',
																					lineHeight: 1,
																					width: 410,
																					paddingRight: 50,
																				}}
																			>
																				Monday
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
																				justifyContent: 'center',
																				fontSize: 65,
																				transform:
																					'translateZ(99.5858px) translateY(83.5624px) rotateX(0.698132deg)',
																				backfaceVisibility: 'hidden',
																				perspective: 1000,
																				color: 'rgba(1, 6, 74, 0.3)',
																				fontFamily: 'sans-serif',
																				fontWeight: 'bold',
																			}}
																		>
																			<div
																				style={{
																					transform: 'rotateX(-0.698132rad)',
																					backfaceVisibility: 'hidden',
																					textAlign: 'right',
																					lineHeight: 1,
																					width: 410,
																					paddingRight: 50,
																				}}
																			>
																				Tuesday
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
																				justifyContent: 'center',
																				fontSize: 65,
																				transform:
																					'translateZ(22.5743px) translateY(128.025px) rotateX(1.39626deg)',
																				backfaceVisibility: 'hidden',
																				perspective: 1000,
																				color: 'rgba(1, 6, 74, 0.3)',
																				fontFamily: 'sans-serif',
																				fontWeight: 'bold',
																			}}
																		>
																			<div
																				style={{
																					transform: 'rotateX(-1.39626rad)',
																					backfaceVisibility: 'hidden',
																					textAlign: 'right',
																					lineHeight: 1,
																					width: 410,
																					paddingRight: 50,
																				}}
																			>
																				Wednesday
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
																				justifyContent: 'center',
																				fontSize: 65,
																				transform:
																					'translateZ(-65px) translateY(112.583px) rotateX(2.0944deg)',
																				backfaceVisibility: 'hidden',
																				perspective: 1000,
																				color: 'rgba(1, 6, 74, 0.3)',
																				fontFamily: 'sans-serif',
																				fontWeight: 'bold',
																			}}
																		>
																			<div
																				style={{
																					transform: 'rotateX(-2.0944rad)',
																					backfaceVisibility: 'hidden',
																					textAlign: 'right',
																					lineHeight: 1,
																					width: 410,
																					paddingRight: 50,
																				}}
																			>
																				Thursday
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
																				justifyContent: 'center',
																				fontSize: 65,
																				transform:
																					'translateZ(-122.16px) translateY(44.4626px) rotateX(2.79253deg)',
																				backfaceVisibility: 'hidden',
																				perspective: 1000,
																				color: 'rgba(1, 6, 74, 0.3)',
																				fontFamily: 'sans-serif',
																				fontWeight: 'bold',
																			}}
																		>
																			<div
																				style={{
																					transform: 'rotateX(-2.79253rad)',
																					backfaceVisibility: 'hidden',
																					textAlign: 'right',
																					lineHeight: 1,
																					width: 410,
																					paddingRight: 50,
																				}}
																			>
																				Wednesday
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
																				justifyContent: 'center',
																				fontSize: 65,
																				transform:
																					'translateZ(-122.16px) translateY(-44.4626px) rotateX(3.49066deg)',
																				backfaceVisibility: 'hidden',
																				perspective: 1000,
																				color: 'rgba(1, 6, 74, 0.3)',
																				fontFamily: 'sans-serif',
																				fontWeight: 'bold',
																			}}
																		>
																			<div
																				style={{
																					transform: 'rotateX(-3.49066rad)',
																					backfaceVisibility: 'hidden',
																					textAlign: 'right',
																					lineHeight: 1,
																					width: 410,
																					paddingRight: 50,
																				}}
																			>
																				Thursday
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
																				justifyContent: 'center',
																				fontSize: 65,
																				transform:
																					'translateZ(-65px) translateY(-112.583px) rotateX(4.18879deg)',
																				backfaceVisibility: 'hidden',
																				perspective: 1000,
																				color: 'rgba(1, 6, 74, 0.3)',
																				fontFamily: 'sans-serif',
																				fontWeight: 'bold',
																			}}
																		>
																			<div
																				style={{
																					transform: 'rotateX(-4.18879rad)',
																					backfaceVisibility: 'hidden',
																					textAlign: 'right',
																					lineHeight: 1,
																					width: 410,
																					paddingRight: 50,
																				}}
																			>
																				Friday
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
																				justifyContent: 'center',
																				fontSize: 65,
																				transform:
																					'translateZ(22.5743px) translateY(-128.025px) rotateX(4.88692deg)',
																				backfaceVisibility: 'hidden',
																				perspective: 1000,
																				color: 'rgba(1, 6, 74, 0.3)',
																				fontFamily: 'sans-serif',
																				fontWeight: 'bold',
																			}}
																		>
																			<div
																				style={{
																					transform: 'rotateX(-4.88692rad)',
																					backfaceVisibility: 'hidden',
																					textAlign: 'right',
																					lineHeight: 1,
																					width: 410,
																					paddingRight: 50,
																				}}
																			>
																				Saturday
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
																				justifyContent: 'center',
																				fontSize: 65,
																				transform:
																					'translateZ(99.5858px) translateY(-83.5624px) rotateX(5.58505deg)',
																				backfaceVisibility: 'hidden',
																				perspective: 1000,
																				color: 'rgba(1, 6, 74, 0.3)',
																				fontFamily: 'sans-serif',
																				fontWeight: 'bold',
																			}}
																		>
																			<div
																				style={{
																					transform: 'rotateX(-5.58505rad)',
																					backfaceVisibility: 'hidden',
																					textAlign: 'right',
																					lineHeight: 1,
																					width: 410,
																					paddingRight: 50,
																				}}
																			>
																				Sunday
																			</div>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</div>
												</div>
												<br />
												<br />
												<div style={{position: 'relative'}}>
													<div
														style={{
															padding: 20,
															backgroundColor: 'rgba(255, 255, 255, 0.1)',
															border: '1px solid rgba(255, 255, 255, 0.2)',
															borderRadius: 70,
														}}
													>
														<div
															style={{
																marginTop: 0,
																marginLeft: 0,
																marginRight: 0,
																display: 'flex',
																backgroundColor: 'rgba(230, 225, 252, 0.8)',
																height: 200,
																flexDirection: 'row',
																alignItems: 'center',
																paddingLeft: 50,
																borderRadius: 50,
																position: 'relative',
																overflow: 'hidden',
																border: '2px solid rgba(255, 255, 255, 0.1)',
															}}
														>
															<div
																style={{
																	position: 'absolute',
																	right: 0,
																	height: '100%',
																	width: 400,
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
																		maskImage:
																			'linear-gradient(transparent 0%, rgb(0, 0, 0) 30%, rgb(0, 0, 0) 70%, transparent 100%)',
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
																			perspective: 10000,
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
																				justifyContent: 'center',
																				fontSize: 65,
																				transform:
																					'translateZ(0.206214px) translateY(-300px) rotateX(4.71308deg)',
																				backfaceVisibility: 'hidden',
																				perspective: 1000,
																				color: 'rgba(1, 6, 74, 0.3)',
																				fontFamily: 'sans-serif',
																				fontWeight: 'bold',
																			}}
																		>
																			<div
																				style={{
																					transform: 'rotateX(-4.71308rad)',
																					backfaceVisibility: 'hidden',
																					textAlign: 'right',
																					lineHeight: 1,
																					width: 410,
																					paddingRight: 50,
																				}}
																			>
																				5 am
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

export const manyLayers = {
	component: Component,
	id: 'many-layers',
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 1,
} as const;
