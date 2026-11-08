import type {CSSProperties} from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';

// Native-size rasters isolate tile geometry from platform interpolation.
export const spaceRaster32 =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAALklEQVR4nO3OoQEAAAyDsP7/9HYGJgJNdtuVDQAAAAAAACAHxH8AAAAAAACAHvBX0fhq85dN7QAAAABJRU5ErkJggg==';
const spaceRaster70 =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAABGCAYAAABxLuKEAAAAt0lEQVR4nO3QsQ0AIACEwN9/aR3A1gQKiusJO9vJa3SAVWMa05jGNKYxHo1pTGMa05jGeDSmMY1pTGMa49GYxjSmMY1pjEdjGtOYxjSmMR6NaUxj/owRNEjhAVZ4gBUeYIUHWOEBVniAFR5ghQdY4QFWeIAVHmCFB1jhAVZ4gBUeYIUHWOEBVniAFR5ghQdY4QFWeIAVHmCFB1jhAVZ4gBUeYIUHWOEBVniAFR5ghQdY4QFWeIDTBX3uI/OEUe73AAAAAElFTkSuQmCC';
const cases: {id: string; src: string; style: CSSProperties}[] = [
	{
		id: 'both',
		src: spaceRaster32,
		style: {
			backgroundRepeat: 'space',
			backgroundSize: '32px 32px',
			backgroundPosition: '50% 50%',
		},
	},
	{
		id: 'horizontal',
		src: spaceRaster32,
		style: {
			backgroundRepeat: 'space no-repeat',
			backgroundSize: '32px 32px',
			backgroundPosition: '50% 50%',
		},
	},
	{
		id: 'fallback',
		src: spaceRaster70,
		style: {
			backgroundRepeat: 'space',
			backgroundSize: '70px 70px',
			backgroundPosition: '50% 50%',
		},
	},
	{
		id: 'vertical',
		src: spaceRaster32,
		style: {
			backgroundRepeat: 'no-repeat space',
			backgroundSize: '32px 32px',
			backgroundPosition: '50% 50%',
		},
	},
];
const Component: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			{[spaceRaster32, spaceRaster70].map((src) => (
				<Img key={src} src={src} style={{display: 'none'}} />
			))}
			{cases.map(({id, src, style}, index) => (
				<div
					key={id}
					style={{
						position: 'absolute',
						left: (index % 2) * 112,
						top: Math.floor(index / 2) * 112,
						width: 112,
						height: 112,
						backgroundColor: 'white',
						backgroundImage: `url("${src}")`,
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
