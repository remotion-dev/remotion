import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {wave} from '@remotion/effects/wave';
import {HtmlInCanvas, useCurrentFrame} from 'remotion';

export const htmlInCanvasResizeFrames = [
	{width: 200, height: 200, red: 20, growBounds: 0},
	{width: 200, height: 180, red: 40, growBounds: 0},
	{width: 160, height: 140, red: 60, growBounds: 0},
	{width: 220, height: 210, red: 80, growBounds: 16},
	{width: 100, height: 80, red: 100, growBounds: 0},
] as const;

const Component: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height, red, growBounds} = htmlInCanvasResizeFrames[frame];

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			growBounds={growBounds}
			effects={[
				linearProgressiveBlur({
					start: [0.5, 0.55],
					end: [0.5, 1],
					endBlur: 10,
				}),
				wave({direction: 'horizontal', amplitude: 8, wavelength: 64}),
			]}
		>
			<div
				data-testid="resize-content"
				style={{
					width: '100%',
					height: '100%',
					backgroundColor: `rgb(${red}, 200, 40)`,
					boxShadow: '-8px 0 blue',
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
