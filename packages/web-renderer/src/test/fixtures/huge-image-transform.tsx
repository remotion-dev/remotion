import {AbsoluteFill, Img, staticFile} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				transform: 'rotateY(15deg) rotateX(5deg)',
			}}
		>
			<Img
				src={staticFile('1.jpg')}
				style={{
					width: '100%',
					scale: 2.5,
				}}
			/>
		</AbsoluteFill>
	);
};

export const hugeImageTransform = {
	component: Component,
	id: 'huge-image-transform',
	width: 2048 / 4,
	height: Math.floor(1367 / 4),
	fps: 30,
	durationInFrames: 1,
} as const;
