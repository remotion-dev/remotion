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

// PR #13105: identity transforms select a local native paint context too.
const contexts = [
	{transform: 'none', ancestor: false},
	{transform: 'matrix(1,0,0,1,0,0)', ancestor: false},
	{transform: 'translate(2px,3px)', ancestor: false},
	{transform: 'scale(2)', ancestor: false},
	{transform: 'scale(1.5)', ancestor: false},
	{transform: 'matrix(1,0,0,1,0,0)', ancestor: true},
	{transform: 'translate(2px,3px)', ancestor: true},
	{transform: 'scale(2)', ancestor: true},
	{transform: 'scale(1.5)', ancestor: true},
];
const Contexts: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{backgroundColor: 'white', imageRendering: 'pixelated'}}
		>
			<Img src={pixelatedRaster} style={{display: 'none'}} />
			{contexts.flatMap(({transform, ancestor}, row) =>
				[0, 1, 2].map((column) => (
					<div
						key={`${transform}-${ancestor}-${column}`}
						style={{
							position: 'absolute',
							left: 4 + column * 64 + frame,
							top: 4 + row * 64 + frame,
							width: 56,
							height: 56,
							transformOrigin: '0 0',
							transform: ancestor ? transform : 'none',
						}}
					>
						<div
							style={{
								width: 56,
								height: 56,
								transformOrigin: '0 0',
								transform: ancestor ? 'none' : transform,
								backgroundImage: `url("${pixelatedRaster}")`,
								backgroundSize: '7px 11px',
								backgroundRepeat: 'no-repeat',
							}}
						/>
					</div>
				)),
			)}
		</AbsoluteFill>
	);
};

export const backgroundImagePixelatedContexts = {
	component: Contexts,
	id: 'background-image-pixelated-contexts',
	width: 192,
	height: 576,
	fps: 25,
	durationInFrames: 2,
} as const;
