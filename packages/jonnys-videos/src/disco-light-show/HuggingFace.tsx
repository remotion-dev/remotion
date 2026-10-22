import {Video} from '@remotion/media';
import React from 'react';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {asset} from './assets';

const HuggingFaceInner: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Interactive.Div
				name="Hugging Face demo crop"
				style={{
					width: 2300,
					height: 1050,
					overflow: 'hidden',
					position: 'absolute',
					transformOrigin: '0% 0%',
					translate: interpolate(
						frame,
						[38, 65, 125, 155],
						['-150px 0px', '-150px 0px', '-990px 0px', '-990px 0px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
					scale: 0.9,
				}}
			>
				<Video
					name="Hugging Face demo"
					src={asset('Screen Recording 2026-07-19 at 10.04.18.mov')}
					style={{
						position: 'absolute',
						width: 2702,
						height: 1496,
						translate: '-350px -140px',
					}}
					durationInFrames={247}
					trimBefore={185}
					playbackRate={0.5}
				/>
			</Interactive.Div>
		</>
	);
};

export const HuggingFace = Interactive.create({
	Component: HuggingFaceInner,
	layout: 'absolute-fill',
});
