import React from 'react';
import {
	CanvasImage,
	Interactive,
	type InteractiveTransformProps,
	type InteractivitySchema,
} from 'remotion';

type SocialSafeZonesProps = InteractiveTransformProps & {
	readonly platform?: 'instagram' | 'tiktok';
};

const socialSafeZonesSchema = {
	platform: {
		type: 'enum',
		default: 'instagram',
		description: 'Platform',
		keyframable: false,
		variants: {
			instagram: {},
			tiktok: {},
		},
	},
	...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const SocialSafeZonesInner: React.FC<SocialSafeZonesProps> = ({
	platform = 'instagram',
	style,
}) => {
	return (
		<div
			style={{
				...style,
				height: 1920,
				left: 0,
				pointerEvents: 'none',
				position: 'absolute',
				top: 0,
				width: 1080,
				zIndex: 2147483647,
			}}
		>
			<CanvasImage
				aria-hidden="true"
				fit="cover"
				height={1920}
				name="Background"
				src="https://remotion.media/elements/commerce-tear-a-graphic.png"
				style={{
					height: '100%',
					left: 0,
					position: 'absolute',
					top: 0,
					width: '100%',
				}}
				width={1080}
			/>
			<CanvasImage
				aria-hidden="true"
				fit="contain"
				height={1920}
				showInTimeline={false}
				src={
					platform === 'tiktok'
						? 'https://remotion.media/elements/social-safe-zones/tiktok-interface.png'
						: 'https://remotion.media/elements/social-safe-zones/instagram-reels-interface-v3.png'
				}
				style={{
					height: '100%',
					left: 0,
					position: 'absolute',
					top: 0,
					width: '100%',
				}}
				width={1080}
			/>
		</div>
	);
};

export const SocialSafeZones = Interactive.withSchema({
	Component: SocialSafeZonesInner,
	componentName: '<SocialSafeZones>',
	schema: socialSafeZonesSchema,
});
