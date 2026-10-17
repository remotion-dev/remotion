import {cylinder} from '@remotion/effects/cylinder';
import React from 'react';
import {
	AbsoluteFill,
	CanvasImage,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

// A transparent strip lets the back of the wheel show through the lettering.
const textSource = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><text x="0" y="394" fill="#b6f34b" font-family="Arial, sans-serif" font-size="100" font-weight="900" textLength="1280" lengthAdjust="spacingAndGlyphs">REMOTION • CREATE • </text></svg>`)}`;

export const CylinderTextDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	return (
		<AbsoluteFill style={{backgroundColor: '#10151c'}}>
			<CanvasImage
				src={textSource}
				width={1280}
				height={720}
				fit="cover"
				effects={[
					cylinder({
						radius: 340,
						rotation: (frame / durationInFrames) * 360,
						rotationX: 52,
						rotationZ: -18,
						shading: 0.65,
					}),
				]}
			/>
		</AbsoluteFill>
	);
};
