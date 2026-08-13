import {radialProgressiveBlur} from '@remotion/effects/radial-progressive-blur';
import {MacOSCursor} from '@remotion/mac-cursors';
import {AbsoluteFill, HtmlInCanvas, useCurrentFrame} from 'remotion';

const Component = () => {
	const frame = useCurrentFrame();
	const cursor = ['default', 'pointer', 'text'][frame] ?? 'default';

	return (
		<HtmlInCanvas
			width={200}
			height={200}
			effects={[
				radialProgressiveBlur({
					center: [0.5, 0.5],
					width: 0.5,
					height: 0.5,
					endBlur: 5,
				}),
			]}
		>
			<AbsoluteFill style={{backgroundColor: 'red'}} />
			<MacOSCursor cursor={cursor} style={{left: 100, top: 100, scale: 3}} />
		</HtmlInCanvas>
	);
};

export const macCursorInHtmlInCanvas = {
	component: Component,
	id: 'mac-cursor-in-html-in-canvas',
	width: 200,
	height: 200,
	fps: 30,
	durationInFrames: 3,
} as const;
