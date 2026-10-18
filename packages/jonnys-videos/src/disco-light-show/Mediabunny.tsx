import React from 'react';
import {
	Interactive,
	Easing,
	CanvasImage,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {asset} from './assets';

const MediabunnyInner: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<CanvasImage
				name="Mediabunny logo"
				src={asset('mediabunny-logo.png')}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[0, 8, 17, 26],
						[
							'1605px 527.5px',
							'105px 527.5px',
							'105px 527.5px',
							'-1395px 527.5px',
						],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
					width: 870,
					height: 865,
					opacity: 0.1,
					scale: 1.7,
				}}
			/>
		</>
	);
};

export const Mediabunny = Interactive.create({
	Component: MediabunnyInner,
	layout: 'absolute-fill',
});
