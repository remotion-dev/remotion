import {fisheye} from '@remotion/effects/fisheye';
import {halftone} from '@remotion/effects/halftone';
import {wave} from '@remotion/effects/wave';
import React from 'react';
import {
	AbsoluteFill,
	HtmlInCanvas,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export const HtmlInCanvasNestedEffects: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			effects={[
				fisheye({
					fieldOfView: 2.3,
					radius: 0.95,
					zoom: 1,
				}),
			]}
		>
			<AbsoluteFill
				style={{
					alignItems: 'center',
					backgroundColor: '#071426',
					backgroundImage:
						'linear-gradient(rgba(90, 185, 255, 0.18) 2px, transparent 2px), linear-gradient(90deg, rgba(90, 185, 255, 0.18) 2px, transparent 2px)',
					backgroundSize: '96px 96px',
					justifyContent: 'center',
				}}
			>
				<div
					style={{
						color: '#9ddcff',
						fontFamily: 'sans-serif',
						fontSize: 34,
						fontWeight: 700,
						left: 80,
						letterSpacing: 8,
						position: 'absolute',
						top: 64,
					}}
				>
					OUTER · FISHEYE
				</div>
				<HtmlInCanvas
					width={960}
					height={640}
					effects={[
						wave({
							amplitude: 34,
							phase: frame * 0.08,
							wavelength: 240,
						}),
					]}
				>
					<AbsoluteFill
						style={{
							alignItems: 'center',
							backgroundColor: '#ffcc00',
							boxShadow: '0 30px 90px rgba(0, 0, 0, 0.35)',
							justifyContent: 'center',
						}}
					>
						<div
							style={{
								color: '#372b00',
								fontFamily: 'sans-serif',
								fontSize: 28,
								fontWeight: 700,
								left: 40,
								letterSpacing: 7,
								position: 'absolute',
								top: 32,
							}}
						>
							LAYER 2 · WAVE
						</div>
						<HtmlInCanvas
							width={520}
							height={320}
							effects={[
								halftone({
									colorMode: 'source',
									dotSize: 14,
									dotSpacing: 16,
									rotation: -8,
								}),
							]}
						>
							<AbsoluteFill
								style={{
									alignItems: 'center',
									backgroundColor: '#ff1744',
									boxShadow: '0 24px 70px rgba(61, 0, 15, 0.4)',
									color: 'white',
									fontFamily: 'sans-serif',
									fontSize: 80,
									fontWeight: 700,
									justifyContent: 'center',
									letterSpacing: -3,
								}}
							>
								Layer 3 · Halftone
							</AbsoluteFill>
						</HtmlInCanvas>
					</AbsoluteFill>
				</HtmlInCanvas>
			</AbsoluteFill>
		</HtmlInCanvas>
	);
};
