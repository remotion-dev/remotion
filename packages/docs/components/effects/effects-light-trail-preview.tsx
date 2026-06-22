import {lightTrail} from '@remotion/effects/light-trail';
import React from 'react';
import {AbsoluteFill, CanvasImage, staticFile} from 'remotion';

export const LIGHT_TRAIL_TEXT_IMAGE_SRC = 'img/effects-light-trail-text.png';

export const LIGHT_TRAIL_PREVIEW_PARAMS = {
	direction: 180,
	distance: 240,
	intensity: 4.5,
	decay: 0.96,
	threshold: 0,
	samples: 64,
	color: '#ffc400',
} as const;

const container: React.CSSProperties = {
	backgroundColor: 'black',
};

const textContainer: React.CSSProperties = {
	alignItems: 'center',
	justifyContent: 'center',
};

const textStyle: React.CSSProperties = {
	color: 'white',
	fontFamily: 'Inter, Arial, Helvetica, system-ui, -apple-system, sans-serif',
	fontSize: 280,
	fontWeight: 900,
	lineHeight: 0.9,
	textAlign: 'center',
};

export const LightTrailTextSource: React.FC = () => {
	return (
		<AbsoluteFill style={textContainer}>
			<div style={textStyle}>TRAIL</div>
		</AbsoluteFill>
	);
};

export const EffectsLightTrailPreview: React.FC<{
	readonly direction: number;
	readonly distance: number;
	readonly intensity: number;
	readonly decay: number;
	readonly threshold: number;
	readonly samples: number;
	readonly color: string;
}> = ({direction, distance, intensity, decay, threshold, samples, color}) => {
	return (
		<AbsoluteFill style={container}>
			<CanvasImage
				src={staticFile(LIGHT_TRAIL_TEXT_IMAGE_SRC)}
				width={1280}
				height={720}
				fit="cover"
				effects={[
					lightTrail({
						direction,
						distance,
						intensity,
						decay,
						threshold,
						samples,
						color,
					}),
				]}
			/>
		</AbsoluteFill>
	);
};
