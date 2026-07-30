import {AbsoluteFill, HtmlInCanvas} from 'remotion';

const Component: React.FC = () => {
	return (
		<HtmlInCanvas
			width={200}
			height={100}
			pixelDensity={2}
			onPaint={({canvas, element, elementImage}) => {
				const context = canvas.getContext('2d');
				if (!context) {
					throw new Error('Could not get context');
				}

				context.reset();
				const transform = context.drawElementImage(
					elementImage,
					0,
					0,
					canvas.width,
					canvas.height,
				);
				element.style.transform = transform.toString();
			}}
		>
			<AbsoluteFill style={{backgroundColor: 'red'}}>
				<div
					style={{
						backgroundColor: 'lime',
						height: 20,
						marginLeft: 40,
						marginTop: 30,
						width: 40,
					}}
				/>
			</AbsoluteFill>
		</HtmlInCanvas>
	);
};

export const nestedHtmlInCanvasPixelDensity = {
	component: Component,
	durationInFrames: 1,
	fps: 30,
	height: 100,
	id: 'nested-html-in-canvas-pixel-density',
	width: 200,
} as const;
