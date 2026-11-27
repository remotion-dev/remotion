import {
	Easing,
	Img,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
	type InteractivitySchema,
} from 'remotion';
import {Credit} from '../Credit';

const galleries = {
	'Paper Shaders': {
		src: 'https://remotion.media/effects-promo-2026-11-27/paper-shaders-1cd8bd76dc21.jpg',
		domain: 'shaders.paper.design',
		href: 'https://shaders.paper.design/',
		imageRatio: 4040 / 2850,
		rotation: '0.62 -0.71 -0.32 23deg',
	},
	Shadertoy: {
		src: 'https://remotion.media/effects-promo-2026-11-27/shadertoy-f3580f771c3d.jpg',
		domain: 'shadertoy.com',
		href: 'https://www.shadertoy.com/results?query=&sort=popular&view=2',
		imageRatio: 1830 / 2676,
		rotation: '0.58 0.74 0.34 23deg',
	},
} as const;

const shaderGallerySchema = {
	gallery: {
		type: 'enum',
		default: 'Paper Shaders',
		description: 'Shader gallery',
		variants: {'Paper Shaders': {}, Shadertoy: {}},
	},
} as const satisfies InteractivitySchema;

const EffectsShaderGalleryContent = ({
	gallery,
}: {
	readonly gallery: keyof typeof galleries;
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, width, height} = useVideoConfig();
	const {src, domain, href, imageRatio, rotation} = galleries[gallery];
	const planeHeight = height * 1.5;
	const planeWidth = Math.max(
		width * 1.25,
		(planeHeight + height * 0.38) / imageRatio,
	);
	const scrollDistance = planeWidth * imageRatio - planeHeight;

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				perspective: 1800,
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					width: planeWidth,
					height: planeHeight,
					translate: '-50% -50%',
					overflow: 'hidden',
					rotate: rotation,
				}}
			>
				<Img
					src={src}
					alt={gallery + ' gallery'}
					style={{
						display: 'block',
						width: '100%',
						translate: `0px ${interpolate(
							frame,
							[2, Math.max(3, durationInFrames - 3)],
							[0, -scrollDistance],
							{
								easing: Easing.bezier(0.38, 0, 0.35, 1),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						)}px`,
					}}
				/>
			</div>
			<Credit
				name="Shader source credit"
				href={href}
				style={{
					fontFamily: 'Effects GT Planar',
					fontSize: width > height ? 34 : 30,
				}}
			>
				{domain}
			</Credit>
		</div>
	);
};

export const EffectsShaderGallery = Interactive.create({
	Component: EffectsShaderGalleryContent,
	layout: 'absolute-fill',
	schema: shaderGallerySchema,
});
