import {Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	HtmlInCanvas,
	interpolate,
	staticFile,
	useCurrentFrame,
} from 'remotion';

export const HtmlInCanvasNested: React.FC = () => {
	const frame = useCurrentFrame();
	const markerX = interpolate(frame, [0, 149], [24, 388], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	if (!HtmlInCanvas.isNestingSupported()) {
		return (
			<AbsoluteFill
				style={{
					backgroundColor: '#180d22',
					color: '#fff',
					fontFamily: 'sans-serif',
					justifyContent: 'center',
					alignItems: 'center',
					textAlign: 'center',
				}}
			>
				<div style={{fontSize: 62, fontWeight: 900, color: '#ff4fa3'}}>
					NESTING UNAVAILABLE
				</div>
				<div style={{fontSize: 30, marginTop: 22}}>
					Use Chrome 157+ with HTML-in-canvas enabled
				</div>
			</AbsoluteFill>
		);
	}

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#09121d',
				color: '#f5fbff',
				fontFamily: 'sans-serif',
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: 80,
					top: 44,
					fontSize: 38,
					fontWeight: 900,
					letterSpacing: 1,
				}}
			>
				NESTED HTML-IN-CANVAS
			</div>
			<div
				style={{
					position: 'absolute',
					right: 80,
					top: 55,
					fontSize: 20,
					color: '#83e8ff',
				}}
			>
				FRAME {String(frame).padStart(3, '0')}
			</div>
			<div
				style={{
					position: 'absolute',
					left: 80,
					top: 122,
					width: 1120,
					height: 520,
					background:
						'repeating-linear-gradient(135deg, #f72585 0 18px, #140b23 18px 36px)',
				}}
			>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: 44,
						fontWeight: 900,
					}}
				>
					OUTER CANVAS MISSING
				</div>
				<HtmlInCanvas width={1120} height={520} name="Outer canvas">
					<div
						style={{
							width: 1120,
							height: 520,
							boxSizing: 'border-box',
							border: '8px solid #46e5ff',
							backgroundColor: '#123047',
							padding: 24,
						}}
					>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								height: 64,
								fontSize: 27,
								fontWeight: 900,
								letterSpacing: 1,
							}}
						>
							<span>OUTER CANVAS · CYAN BORDER</span>
							<span style={{color: '#83e8ff'}}>FRAME {frame}</span>
						</div>
						<div style={{display: 'flex', gap: 24}}>
							<div
								style={{
									width: 500,
									height: 330,
									background:
										'repeating-linear-gradient(45deg, #ff3b72 0 16px, #300b28 16px 32px)',
								}}
							>
								<HtmlInCanvas
									width={500}
									height={330}
									name="Nested video canvas"
								>
									<div
										style={{
											width: 500,
											height: 330,
											backgroundColor: '#ff3b72',
											boxSizing: 'border-box',
											border: '5px solid #ffc247',
										}}
									>
										<div
											style={{
												height: 42,
												paddingLeft: 14,
												backgroundColor: '#131922',
												fontSize: 20,
												fontWeight: 900,
												lineHeight: '42px',
											}}
										>
											INNER A · VIDEO · YELLOW BORDER
										</div>
										<div
											style={{position: 'relative', width: 490, height: 278}}
										>
											<div
												style={{
													position: 'absolute',
													inset: 0,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													fontSize: 34,
													fontWeight: 900,
												}}
											>
												VIDEO MISSING
											</div>
											<Video
												src={staticFile('demo_smpte_h264_aac.mp4')}
												volume={0}
												loop
												objectFit="cover"
												style={{
													position: 'absolute',
													left: 0,
													top: 0,
													zIndex: 1,
													width: 490,
													height: 278,
												}}
											/>
										</div>
									</div>
								</HtmlInCanvas>
							</div>
							<div
								style={{
									width: 500,
									height: 330,
									background:
										'repeating-linear-gradient(45deg, #ff3b72 0 16px, #300b28 16px 32px)',
								}}
							>
								<HtmlInCanvas
									width={500}
									height={330}
									name="Nested graphics canvas"
								>
									<div
										style={{
											width: 500,
											height: 330,
											boxSizing: 'border-box',
											border: '5px solid #b4ff5c',
											backgroundColor: '#181038',
										}}
									>
										<div
											style={{
												height: 42,
												paddingLeft: 14,
												backgroundColor: '#131922',
												fontSize: 20,
												fontWeight: 900,
												lineHeight: '42px',
											}}
										>
											INNER B · GRAPHICS · LIME BORDER
										</div>
										<div
											style={{
												position: 'relative',
												width: 490,
												height: 278,
												background: 'linear-gradient(135deg, #29145d, #0d1731)',
											}}
										>
											<div
												style={{
													position: 'absolute',
													left: markerX,
													top: 66,
													width: 92,
													height: 92,
													borderRadius: '50%',
													backgroundColor: '#b4ff5c',
													boxShadow: '0 0 35px #b4ff5caa',
												}}
											/>
											<div
												style={{
													position: 'absolute',
													bottom: 20,
													left: 24,
													fontSize: 30,
													fontWeight: 900,
													color: '#fff',
												}}
											>
												FRAME {frame} / MOVING DOT
											</div>
										</div>
									</div>
								</HtmlInCanvas>
							</div>
						</div>
					</div>
				</HtmlInCanvas>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 80,
					bottom: 16,
					fontSize: 18,
					color: '#aec9d9',
					lineHeight: '26px',
				}}
			>
				<div>
					PASS: cyan, yellow and lime borders; video timecode and dot advance.
				</div>
				<div style={{color: '#ff6aa5'}}>
					FAIL: any hot pink shows through a canvas or the video.
				</div>
			</div>
		</AbsoluteFill>
	);
};
