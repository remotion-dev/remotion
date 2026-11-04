import React, {useMemo} from 'react';
import {
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {asset} from './assets';
import {type ClippingArt, RansomClipping, useDataUrl} from './RansomClipping';
import {StickerSound} from './StickerSound';

const RemotionStickerInner: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const logo = useDataUrl(asset('remotion-logo.svg'));
	const art = useMemo<ClippingArt | null>(
		() =>
			logo === null
				? null
				: {type: 'image', href: logo, scale: 0.62, keyWhite: false},
		[logo],
	);
	if (art === null) {
		return null;
	}

	return (
		<Interactive.Div
			name="Remotion sticker placement"
			style={{
				position: 'absolute',
				left: 330,
				top: 940,
				width: 420,
				height: 350,
				transformOrigin: '50% 50%',
				rotate: '7deg',
			}}
		>
			<StickerSound name="Remotion sticker sound" large pitch={1.04} />
			<RansomClipping
				name="Remotion symbol on paper"
				seed="tech-Remotion"
				color="#f5f0e6"
				width={420}
				height={350}
				art={art}
				turn={interpolate(frame, [0, 0.5 * fps], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					posterize: 3,
					easing: Easing.linear,
				})}
				turnDirection={315}
				turnRadius={54}
				unit={0.77}
			/>
		</Interactive.Div>
	);
};

export const RemotionSticker = Interactive.create({
	Component: RemotionStickerInner,
	layout: 'absolute-fill',
});
