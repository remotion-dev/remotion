import {grayscale} from '@remotion/effects/grayscale';
import React from 'react';
import {
	AnimatedImage,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {asset} from './assets';
import {Text} from './Text';

const OneShotInner: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<AnimatedImage
				name="One-shot reaction"
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
			<Text
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
					scale: 0.7857142857142857,
					translate: interpolate(
						frame,
						[0, 8, 56, 60],
						['1400px 0px', '0px 0px', '0px 0px', '-1400px 0px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
				}}
			>
				One-Shot
			</Text>
		</>
	);
};

export const OneShot = Interactive.create({
	Component: OneShotInner,
	layout: 'absolute-fill',
});
