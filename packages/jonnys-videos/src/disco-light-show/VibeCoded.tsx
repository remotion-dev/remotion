import {Video} from '@remotion/media';
import React from 'react';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {asset} from './assets';
import {PaperBox} from './PaperBox';

const VibeCodedInner: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<PaperBox
				name="Transparent video layer export paper box"
				width={2070}
				height={1470}
				visualScale={0.75}
				seed={4}
				style={{
					position: 'absolute',
					transformOrigin: '0% 0%',
					translate: interpolate(
						frame,
						[35, 70, 125, 142],
						['-420px 120px', '-420px 120px', '-350px 40px', '-350px 40px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
					scale: 0.75,
				}}
			>
				<Video
					name="Transparent video layer export"
					src={asset('Screen Recording 2026-07-19 at 17.43.33.mov')}
					style={{
						position: 'absolute',
						width: 2702,
						height: 1492,
						translate: '-320px 0px',
					}}
					durationInFrames={294}
					trimBefore={3409}
					playbackRate={2}
					from={-4}
				/>
			</PaperBox>
		</>
	);
};

export const VibeCoded = Interactive.create({
	Component: VibeCodedInner,
	layout: 'absolute-fill',
});
