import {sphere} from '@remotion/effects/sphere';
import React from 'react';
import {
	CanvasImage,
	Interactive,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
	type InteractivitySchema,
} from 'remotion';

type SpinningGlobeProps = InteractiveTransformProps & {
	readonly src: string;
	readonly speed?: number;
	readonly longitude?: number;
	readonly shading?: number;
};

const spinningGlobeSchema = {
	src: {
		type: 'asset',
		assetType: 'image',
		default: 'https://remotion.media/earth.jpg',
		description: 'Globe texture',
		keyframable: false,
	},
	speed: {
		type: 'number',
		min: -1,
		max: 1,
		step: 0.01,
		default: 1 / 8,
		description: 'Revolutions per second',
		hiddenFromList: false,
	},
	longitude: {
		type: 'rotation-degrees',
		default: 0,
		description: 'Starting longitude',
	},
	shading: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 0.35,
		description: 'Shading',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const SpinningGlobeInner: React.FC<SpinningGlobeProps> = ({
	src,
	speed = 1 / 8,
	longitude = 0,
	shading = 0.35,
	style,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<div style={{width: 840, height: 840, ...style}}>
			<CanvasImage
				src={src}
				width={840}
				height={840}
				fit="fill"
				effects={[
					sphere({
						radius: 420,
						rotationY: longitude + (frame / fps) * speed * 360,
						shading,
					}),
				]}
			/>
		</div>
	);
};

export const SpinningGlobe = Interactive.create({
	Component: SpinningGlobeInner,
	componentName: '<SpinningGlobe>',
	schema: spinningGlobeSchema,
});
