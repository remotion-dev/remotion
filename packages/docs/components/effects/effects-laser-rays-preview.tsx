import {laserRays} from '@remotion/effects/laser-rays';
import React from 'react';
import {AbsoluteFill, HtmlInCanvas} from 'remotion';

export const EffectsLaserRaysPreview: React.FC<{
	readonly color: string;
	readonly backgroundColor: string;
	readonly center: readonly [number, number];
	readonly rayCount: number;
	readonly sharpness: number;
	readonly intensity: number;
	readonly amount: number;
	readonly rotation: number;
	readonly radiusFalloff: number;
}> = ({
	color,
	backgroundColor,
	center,
	rayCount,
	sharpness,
	intensity,
	amount,
	rotation,
	radiusFalloff,
}) => {
	const textStyle: React.CSSProperties = {
		color: '#f8f2d0',
		fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
		fontSize: 196,
		fontWeight: 900,
		letterSpacing: 0,
		lineHeight: 0.82,
		textShadow: '0 0 0 #d8b36c, 0 8px 0 #80652d, 0 -4px 0 #fff7c7',
		textTransform: 'uppercase',
	};

	if (typeof window === 'undefined' || !HtmlInCanvas.isSupported()) {
		return (
			<AbsoluteFill
				style={{
					alignItems: 'center',
					backgroundColor: '#f0e6d1',
					justifyContent: 'center',
				}}
			>
				<div style={textStyle}>Laser</div>
			</AbsoluteFill>
		);
	}

	return (
		<AbsoluteFill style={{backgroundColor: '#f0e6d1'}}>
			<HtmlInCanvas
				width={1280}
				height={720}
				effects={[
					laserRays({
						color,
						backgroundColor,
						center,
						rayCount,
						sharpness,
						intensity,
						amount,
						rotation,
						radiusFalloff,
					}),
				]}
			>
				<AbsoluteFill
					style={{
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<div
						style={textStyle}
					>
						Laser
					</div>
				</AbsoluteFill>
			</HtmlInCanvas>
		</AbsoluteFill>
	);
};
