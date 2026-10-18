import React from 'react';
import {CanvasImage, Interactive} from 'remotion';
import {asset} from './assets';

// Adapted from https://www.remotion.dev/elements/overlays/social-safe-zones/.
// Use its calibrated interface overlays without the Element's sample background.
const SocialSafeZonesInner: React.FC<{
	readonly platform: 'instagram' | 'tiktok';
}> = ({platform}) => {
	return (
		<CanvasImage
			name="Platform interface"
			src={asset(
				platform === 'tiktok'
					? 'tiktok-interface-723936d52883.png'
					: 'instagram-reels-interface-cbef97db64f2.png',
			)}
			width={1080}
			height={1920}
			fit="contain"
			showInTimeline={false}
			style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}
		/>
	);
};

export const SocialSafeZones = Interactive.create({
	Component: SocialSafeZonesInner,
	layout: 'absolute-fill',
	schema: {
		platform: {
			type: 'enum',
			default: 'instagram',
			description: 'Platform',
			keyframable: false,
			variants: {instagram: {}, tiktok: {}},
		},
	},
});
