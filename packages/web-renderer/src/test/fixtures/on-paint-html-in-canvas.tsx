import {AbsoluteFill, HtmlInCanvas} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#0000ff'}}>
			<HtmlInCanvas
				width={100}
				height={100}
				onPaint={({canvas}) => {
					const gl = canvas.getContext('webgl2');
					if (!gl) {
						throw new Error('Expected a WebGL2 context');
					}

					gl.clearColor(0, 1, 0, 1);
					gl.clear(gl.COLOR_BUFFER_BIT);
				}}
			>
				{/* The callback paints green. Seeing this red child means that the DOM
				composer ignored the painted canvas and rendered its layout subtree. */}
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
