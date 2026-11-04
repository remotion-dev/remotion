import {sphere, type SphereRender} from '@remotion/effects/sphere';
import React from 'react';
import {
	AbsoluteFill,
	CanvasImage,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

// Natural Earth II, 1:50m, shaded relief and water; resized to 4096 × 2048.
// Source: https://www.naturalearthdata.com/downloads/50m-raster-data/50m-natural-earth-2/
// Public domain; attribution is explicitly unnecessary:
// https://www.naturalearthdata.com/about/terms-of-use/
export const SPHERE_GLOBE_TEXTURE_SRC = 'https://remotion.media/earth.jpg';

export const EffectsSpherePreview: React.FC<{
	readonly radius: number;
	readonly rotationX: number;
	readonly rotationY: number;
	readonly rotationZ: number;
	readonly position: readonly [number, number];
	readonly render: SphereRender;
	readonly shading: number;
}> = (params) => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<CanvasImage
				src={SPHERE_GLOBE_TEXTURE_SRC}
				width={1280}
				height={720}
				fit="fill"
				effects={[sphere(params)]}
			/>
		</AbsoluteFill>
	);
};

export const SpinningGlobeDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	return (
		<EffectsSpherePreview
			radius={300}
			rotationX={0}
			rotationY={(frame / durationInFrames) * 360}
			rotationZ={0}
			position={[0.5, 0.5]}
			render="both"
			shading={0.35}
		/>
	);
};
