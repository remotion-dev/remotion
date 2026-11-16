import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';

// Opaque 16x8 raster with a red upper half and blue lower half.
const raster =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAICAYAAADwdn+XAAAAGElEQVR4nGP4z8DwnxLMMAwMoFD/cDAAAI2m/wFston3AAAAAElFTkSuQmCC';
const Component: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<Img src={raster} style={{display: 'none'}} />
			<div
				style={{
					width: 101,
					height: 128,
					backgroundColor: 'white',
					backgroundImage: `url("${raster}")`,
					backgroundPosition: '0% 0%',
					backgroundRepeat: 'repeat',
					backgroundSize: 'contain',
					transform: `translate(${frame}px,${frame}px)`,
				}}
			/>
		</AbsoluteFill>
	);
};

export const backgroundImageContain = {
	component: Component,
	id: 'background-image-contain',
	width: 101,
	height: 128,
	fps: 25,
	durationInFrames: 2,
} as const;
