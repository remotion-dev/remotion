import {AbsoluteFill, HtmlInCanvas} from 'remotion';

// A minimal custom-onPaint composition. A custom `onPaint` forces
// <HtmlInCanvas> onto the transferred-OffscreenCanvas path
// (`usesDirectLayoutCanvas === false`), unlike effects-only usage which
// paints the readable layout canvas directly. The handler ignores the
// captured HTML (solid red) and fills the canvas solid green, so a still
// can assert with a single pixel probe which surface ended up in the
// output: green = painted canvas content, red = re-rasterized layout-only
// children, transparent/background = the transferred placeholder canvas
// that reads back as empty.
const Component: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#0000ff'}}>
			<HtmlInCanvas
				width={100}
				height={100}
				onPaint={({canvas}) => {
					const ctx = canvas.getContext('2d');
					if (!ctx) {
						throw new Error('Expected a 2d context');
					}

					ctx.fillStyle = '#00ff00';
					ctx.fillRect(0, 0, canvas.width, canvas.height);
				}}
			>
				<AbsoluteFill style={{backgroundColor: '#ff0000'}} />
			</HtmlInCanvas>
		</AbsoluteFill>
	);
};

export const onPaintHtmlInCanvas = {
	component: Component,
	id: 'on-paint-html-in-canvas',
	width: 100,
	height: 100,
	fps: 30,
	durationInFrames: 5,
} as const;
