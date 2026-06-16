import React from 'react';
import {CanvasImage} from 'remotion';
import {paletteMap} from './palette-map';

const SAMPLE_IMAGE = 'https://remotion.media/transition-bg-blue.jpg';
const SOLAR_PALETTE = ['#111827', '#06b6d4', '#facc15'] as const;

export const PaletteMapEffect: React.FC = () => {
	return (
		<CanvasImage
			src={SAMPLE_IMAGE}
			width={1920}
			height={1080}
			fit="cover"
			style={{
				height: '100%',
				width: '100%',
			}}
			effects={[paletteMap({palette: SOLAR_PALETTE})]}
		/>
	);
};
