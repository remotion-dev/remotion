import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {HtmlInCanvas, useCurrentFrame} from 'remotion';

export const htmlInCanvasResizeFrames = [
	{width: 200, height: 200, red: 20},
	{width: 200, height: 180, red: 40},
	{width: 160, height: 140, red: 60},
	{width: 220, height: 210, red: 80},
	{width: 100, height: 80, red: 100},
] as const;

const Component: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height, red} = htmlInCanvasResizeFrames[frame];

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			effects={[
				linearProgressiveBlur({
					start: [0.5, 0.55],
					end: [0.5, 1],
					endBlur: 10,
				}),
			]}
		>
			<div
				data-testid="resize-content"
				style={{
					width: '100%',
					height: '100%',
					backgroundColor: `rgb(${red}, 200, 40)`,
				}}
			/>
		</HtmlInCanvas>
	);
};

export const htmlInCanvasResize = {
	component: Component,
	id: 'html-in-canvas-resize',
	width: 220,
	height: 210,
	fps: 30,
	durationInFrames: htmlInCanvasResizeFrames.length,
} as const;
