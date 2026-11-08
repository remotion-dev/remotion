import type {CSSProperties} from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';

// Opaque 16x8 raster with a red upper half and blue lower half.
const raster =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAICAYAAADwdn+XAAAAGElEQVR4nGP4z8DwnxLMMAwMoFD/cDAAAI2m/wFston3AAAAAElFTkSuQmCC';
const cases: CSSProperties[] = [
	{
		backgroundRepeat: 'space',
		backgroundSize: '32px 32px',
		backgroundPosition: '50% 50%',
	},
	{
		backgroundRepeat: 'space no-repeat',
		backgroundSize: '32px 32px',
		backgroundPosition: '50% 50%',
	},
	{
		backgroundRepeat: 'space',
		backgroundSize: '70px 70px',
		backgroundPosition: '50% 50%',
	},
	{
		backgroundRepeat: 'no-repeat space',
		backgroundSize: '32px 32px',
		backgroundPosition: '50% 50%',
	},
];
const Component: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<Img src={raster} style={{display: 'none'}} />
			{cases.map((style, index) => (
				<div
					key={`${style.backgroundRepeat}-${style.backgroundSize}`}
					style={{
						position: 'absolute',
						left: (index % 2) * 112,
						top: Math.floor(index / 2) * 112,
						width: 112,
						height: 112,
						backgroundColor: 'white',
						backgroundImage: `url("${raster}")`,
						backgroundPosition: '0% 0%',
						...style,
						transform: `translate(${frame}px,${frame}px)`,
					}}
				/>
			))}
		</AbsoluteFill>
	);
};

export const backgroundImageSpace = {
	component: Component,
	id: 'background-image-space',
	width: 224,
	height: 224,
	fps: 25,
	durationInFrames: 2,
} as const;
