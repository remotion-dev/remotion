import {Video} from '@remotion/media';
import React from 'react';
import {
	Easing,
	Interactive,
	interpolate,
	Solid,
	useCurrentFrame,
} from 'remotion';
import {asset} from './assets';
import {Mediabunny} from './Mediabunny';

const VibeCodedInner: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Solid
				name="Export interface background"
				color="#0a0912"
				width={1080}
				height={1920}
				style={{position: 'absolute'}}
			/>
			<Video
				name="Transparent video layer export"
				src={asset('Screen Recording 2026-07-19 at 17.43.33.mov')}
				style={{
					position: 'absolute',
					width: 2702,
					height: 1492,
					transformOrigin: '0% 0%',
					// Follow the layer tabs and export button, then hold on processing.
					translate: interpolate(
						frame,
						[0, 25, 45, 87, 98, 104, 115],
						[
							'-622px -200px',
							'-622px -200px',
							'-676px -243px',
							'-676px -243px',
							'-2027.3px -617px',
							'-2027.3px -617px',
							'-703px -273px',
						],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
					scale: interpolate(
						frame,
						[0, 25, 45, 87, 98, 104, 115],
						[0.86, 0.86, 0.9, 0.9, 1.15, 1.15, 0.92],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
							output: 'perceptual-scale',
						},
					),
				}}
				// Freeze the footage at 122.5s, before the downloads panel opens.
				freeze={frame >= 129 ? 133 : null}
				durationInFrames={336}
				trimBefore={3409}
				playbackRate={2}
				from={-4}
			/>
			<Mediabunny
				name="Mediabunny sticker"
				from={138}
				durationInFrames={24}
				width={1080}
				height={1920}
			/>
		</>
	);
};

export const VibeCoded = Interactive.create({
	Component: VibeCodedInner,
	layout: 'absolute-fill',
});
