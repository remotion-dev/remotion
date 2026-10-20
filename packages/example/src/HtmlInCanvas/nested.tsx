import {invert} from '@remotion/effects/invert';
import {wave} from '@remotion/effects/wave';
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
				<HtmlInCanvas
					width={1120}
					height={520}
					name="Outer canvas"
					effects={[invert({})]}
				>
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
							<span>OUTER CANVAS · INVERT EFFECT</span>
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
									effects={[
										wave({
											amplitude: interpolate(frame, [10, 122], [8, 60], {
												extrapolateLeft: 'clamp',
												extrapolateRight: 'clamp',
											}),

											wavelength: 180,
										}),
									]}
								>
									<div
										style={{
											width: 500,
											height: 330,
											backgroundColor: '#ff3b72',
											position: 'relative',
										}}
									>
										<div
											style={{
												position: 'absolute',
												top: 5,
												left: 5,
												right: 5,
												zIndex: 2,
												height: 42,
												paddingLeft: 14,
												backgroundColor: '#131922',
												fontSize: 20,
												fontWeight: 900,
												lineHeight: '42px',
											}}
										>
											VIDEO CANVAS · WAVE EFFECT
										</div>
										<div
											style={{position: 'relative', width: 500, height: 330}}
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
													width: 500,
													height: 330,
												}}
											/>
										</div>
										<div
											style={{
												position: 'absolute',
												inset: 0,
												zIndex: 3,
												boxSizing: 'border-box',
												border: '5px solid #ffc247',
											}}
										/>
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
					PASS: outer colors invert; the nested video ripples as frames advance.
				</div>
				<div style={{color: '#ff6aa5'}}>
					FAIL: striped gaps or VIDEO MISSING text show through.
				</div>
			</div>
		</AbsoluteFill>
	);
};
