import type {CSSProperties} from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';

export const pixelatedRaster =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR4nGP4z8DwHwyBNBgAAEnICff5q7YNAAAAAElFTkSuQmCC';
const cases: CSSProperties[] = [
	{backgroundSize: '16px 16px', backgroundRepeat: 'repeat'},
	{backgroundSize: '12px 8px', backgroundRepeat: 'no-repeat'},
	{backgroundSize: '16px 16px', backgroundRepeat: 'repeat-x'},
	{backgroundSize: '16px 16px', backgroundRepeat: 'repeat-y'},
];
const Component: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{backgroundColor: 'white', imageRendering: 'pixelated'}}
		>
			{/* Children inherit the author-selected image sampler. */}
			<Img src={pixelatedRaster} style={{display: 'none'}} />
			{cases.map((style, index) => (
				<div
					key={`${style.backgroundSize}-${style.backgroundRepeat}`}
					style={{
						position: 'absolute',
						left: 4 + (index % 2) * 64,
						top: 4 + Math.floor(index / 2) * 64,
						width: 56,
						height: 56,
						backgroundImage: `url("${pixelatedRaster}")`,
						backgroundPosition: '0% 0%',
						...style,
						transform: `translate(${frame}px,${frame}px)`,
					}}
				/>
			))}
		</AbsoluteFill>
	);
};

export const backgroundImagePixelated = {
	component: Component,
	id: 'background-image-pixelated',
	width: 128,
	height: 128,
	fps: 25,
	durationInFrames: 2,
} as const;
