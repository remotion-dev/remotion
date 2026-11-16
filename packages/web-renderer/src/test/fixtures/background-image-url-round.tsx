import type {CSSProperties} from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';

// Opaque 16x8 raster with a red upper half and blue lower half.
const raster =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAICAYAAADwdn+XAAAAGElEQVR4nGP4z8DwnxLMMAwMoFD/cDAAAI2m/wFston3AAAAAElFTkSuQmCC';
const cases: CSSProperties[] = [
	{backgroundRepeat: 'round', backgroundSize: '35px 35px'},
	{backgroundRepeat: 'round repeat', backgroundSize: '35px auto'},
	{backgroundRepeat: 'repeat round', backgroundSize: 'auto 35px'},
	{backgroundRepeat: 'round', backgroundSize: '200px 200px'},
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
						left: (index % 2) * 96,
						top: Math.floor(index / 2) * 96,
						width: 96,
						height: 96,
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

export const backgroundImageRound = {
	component: Component,
	id: 'background-image-round',
	width: 192,
	height: 192,
	fps: 25,
	durationInFrames: 2,
} as const;
