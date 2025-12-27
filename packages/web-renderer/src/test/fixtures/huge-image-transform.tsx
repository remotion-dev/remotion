import {AbsoluteFill, Img, staticFile} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				transform: 'rotateY(15deg)',
				overflow: 'hidden',
			}}
		>
			<Img
				src={staticFile('1.jpg')}
				style={{
					width: '100%',
					scale: 100,
				}}
			/>
		</AbsoluteFill>
	);
};

export const hugeImageTransform = {
	component: Component,
	id: 'huge-image-transform',
	width: 512,
	height: 512,
	fps: 30,
	durationInFrames: 1,
} as const;
