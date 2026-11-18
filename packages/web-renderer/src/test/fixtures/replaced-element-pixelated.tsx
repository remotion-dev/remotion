import type {CSSProperties} from 'react';
import {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
export const pixelatedReplacedRaster =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR4nGP4z8DwHwyBNBgAAEnICff5q7YNAAAAAElFTkSuQmCC';
const sizes: CSSProperties[] = [
	{width: 32, height: 16, objectFit: 'fill'},
	{width: 32, height: 16, objectFit: 'cover'},
	{width: 16, height: 32, objectFit: 'contain'},
];
const PaletteCanvas: React.FC<{style: CSSProperties}> = ({style}) => {
	const ref = useRef<HTMLCanvasElement>(null);
	useLayoutEffect(() => {
		const ctx = ref.current!.getContext('2d')!;
		['red', 'lime', 'blue', 'yellow'].forEach((color, index) => {
			ctx.fillStyle = color;
			ctx.fillRect(index % 2, Math.floor(index / 2), 1, 1);
		});
	}, []);
	return <canvas ref={ref} width={2} height={2} style={style} />;
};

const Component: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{backgroundColor: 'white', imageRendering: 'pixelated'}}
		>
			{sizes.flatMap((size, index) =>
				[false, true].map((canvas) => {
					const style: CSSProperties = {
						position: 'absolute',
						left: 4 + index * 48 + frame,
						top: 4 + (canvas ? 48 : 0) + frame,
						...size,
					};
					return canvas ? (
						<PaletteCanvas key={`canvas-${size.objectFit}`} style={style} />
					) : (
						<Img
							key={`image-${size.objectFit}`}
							src={pixelatedReplacedRaster}
							style={style}
						/>
					);
				}),
			)}
		</AbsoluteFill>
	);
};

export const replacedElementPixelated = {
	component: Component,
	id: 'replaced-element-pixelated',
	width: 144,
	height: 96,
	fps: 25,
	durationInFrames: 2,
} as const;
