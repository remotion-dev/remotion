import {noiseDisplacement} from '@remotion/effects/noise-displacement';
import React from 'react';
import {AbsoluteFill, HtmlInCanvas, useVideoConfig} from 'remotion';

export const NoiseDisplacementText: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			effects={[
				noiseDisplacement({
					center: [0.5, 0.5],
					radius: 0.28,
					strength: 64,
					seed: 8,
					grainSize: 10,
					passes: 7,
					blur: 1,
					feather: 0.25,
					biasDirection: 225,
					biasAmount: 0.2,
				}),
			]}
		>
			<AbsoluteFill
				style={{
					alignItems: 'center',
					backgroundColor: 'black',
					justifyContent: 'center',
				}}
			>
				<div
					style={{
						color: 'white',
						fontFamily:
							'Inter, Arial, Helvetica, system-ui, -apple-system, sans-serif',
						fontSize: 180,
						fontWeight: 900,
						letterSpacing: -10,
						lineHeight: 0.9,
						textAlign: 'center',
					}}
				>
					NOISE
				</div>
			</AbsoluteFill>
		</HtmlInCanvas>
	);
};
