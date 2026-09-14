import {grayscale} from '@remotion/effects/grayscale';
import React from 'react';
import {
	AnimatedImage,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {asset} from './assets';

export const OneShot: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<AnimatedImage
				src={asset('Eu0CBaxXpj8DK85e61.webp')}
				style={{
					position: 'absolute',
					translate: '300px 395px',
					width: 480,
					height: 290,
					scale: 2.885,
				}}
				effects={[grayscale({})]}
				playbackRate={0.5}
			/>
			<Interactive.Div
				name="One-Shot title"
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					color: 'white',
					WebkitTextStroke: '4px black',
					fontSize: 164,
					fontWeight: 900,
					scale: interpolate(frame, [0, 56, 59], [0, 0.7857142857142857, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
					opacity: interpolate(frame, [56, 59], [1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				One-Shot
			</Interactive.Div>
		</>
	);
};
