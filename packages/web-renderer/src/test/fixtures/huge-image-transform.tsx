import {AbsoluteFill, Img, staticFile} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				overflow: 'hidden',
			}}
		>
			<Img
				width={150}
				src={staticFile('1.jpg')}
				alt="Wolf"
				style={{
					transform: 'scale(100) rotateY(15deg) rotateX(5deg)',
					transformOrigin: 'center',
				}}
			/>
		</AbsoluteFill>
	);
};

export const hugeImageTransform = {
	component: Component,
	id: 'huge-image-transform',
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 1,
} as const;
