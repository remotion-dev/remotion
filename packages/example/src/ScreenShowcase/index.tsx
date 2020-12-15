import React from 'react';
import {
	interpolate,
	spring,
	SpringConfig,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

type Props = {
	title: string;
	getImage: (frame: number) => string;
	animateIn: boolean;
};

export const ScreenShowcase: React.FC<Props> = ({
	title = 'Hi',
	getImage = (f) =>
		require('../Welcome/stickerify-yourself/Untitled Frame ' + (f + 1) + '.png')
			.default,
	animateIn = true,
}) => {
	const frame = useCurrentFrame();

	const {fps} = useVideoConfig();
	const src = getImage(frame);

	const springConfig: SpringConfig = {
		damping: 100,
		mass: 0.2,
		stiffness: 100,
		overshootClamping: false,
	};

	const base = animateIn
		? spring({
				config: springConfig,
				from: 0,
				to: 1,
				fps,
				frame,
		  })
		: 1;

	const progress = interpolate(base, [0, 1], [0.8, 1]);

	return (
		<div style={{flex: 1, backgroundColor: 'white'}}>
			<div
				style={{
					fontSize: 80,
					fontWeight: 'bold',
					fontFamily: 'SF Pro Text',
					width: '100%',
					position: 'absolute',
					textAlign: 'center',
					top: 160,
					transform: `scale(${progress}) translateY(${(1 - base) * 50}px)`,
				}}
			>
				{title}
			</div>
			<img
				src={src}
				style={{
					position: 'absolute',
					transform: `scale(${1.5 * progress})`,
					top: 500,
				}}
			/>
		</div>
	);
};

export default ScreenShowcase;
