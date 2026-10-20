import React, {useMemo} from 'react';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {asset} from './assets';
import {type ClippingArt, RansomClipping, useDataUrl} from './RansomClipping';
import {StickerSound} from './StickerSound';

const MediabunnyInner: React.FC = () => {
	const frame = useCurrentFrame();
	const logo = useDataUrl(asset('mediabunny-logo (1).svg'));
	const art = useMemo<ClippingArt | null>(
		() =>
			logo === null
				? null
				: {type: 'image', href: logo, scale: 0.7, keyWhite: false},
		[logo],
	);
	if (art === null) {
		return null;
	}

	return (
		<Interactive.Div
			name="Mediabunny sticker placement"
			style={{
				position: 'absolute',
				left: -214,
				top: 264,
				width: 1508,
				height: 1092,
				transformOrigin: '50% 50%',
				rotate: '-8deg',
			}}
		>
			<StickerSound name="Mediabunny sticker sound" large pitch={0.96} />
			<RansomClipping
				name="Mediabunny sticker"
				seed="tech-Mediabunny"
				color="#ffcf2e"
				width={1508}
				height={1092}
				art={art}
				turn={interpolate(frame, [0, 15], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					posterize: 3,
					easing: Easing.linear,
				})}
				turnDirection={315}
				turnRadius={182}
				unit={2.6}
			/>
		</Interactive.Div>
	);
};

export const Mediabunny = Interactive.create({
	Component: MediabunnyInner,
	layout: 'absolute-fill',
});
