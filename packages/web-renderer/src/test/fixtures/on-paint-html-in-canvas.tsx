import React, {useCallback, useRef} from 'react';
import {
	AbsoluteFill,
	HtmlInCanvas,
	type HtmlInCanvasOnInit,
	type HtmlInCanvasOnPaint,
} from 'remotion';

const ElementImageComponent: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#0000ff'}}>
			<HtmlInCanvas
				width={100}
				height={100}
				onPaint={({canvas, elementImage}) => {
					const ctx = canvas.getContext('2d');
					if (!ctx) {
						throw new Error('Expected a 2D context');
					}

					ctx.reset();
					ctx.drawElementImage(elementImage, 0, 0);
					ctx.globalCompositeOperation = 'source-in';
					ctx.fillStyle = '#00ff00';
					ctx.fillRect(0, 0, canvas.width, canvas.height);
				}}
			>
				<AbsoluteFill style={{backgroundColor: '#ff0000'}} />
			</HtmlInCanvas>
		</AbsoluteFill>
	);
};

const WebGlComponent: React.FC = () => {
	const glRef = useRef<WebGL2RenderingContext | null>(null);

	const onInit: HtmlInCanvasOnInit = useCallback(({canvas}) => {
		const gl = canvas.getContext('webgl2');
		if (!gl) {
			throw new Error('Expected a WebGL2 context');
		}

		glRef.current = gl;
		return () => {
			glRef.current = null;
		};
	}, []);

	const onPaint: HtmlInCanvasOnPaint = useCallback(() => {
		const gl = glRef.current;
		if (!gl) {
			throw new Error('Expected WebGL to be initialized');
		}

		gl.clearColor(0, 1, 1, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}, []);

	return (
		<AbsoluteFill style={{backgroundColor: '#0000ff'}}>
			<HtmlInCanvas width={100} height={100} onInit={onInit} onPaint={onPaint}>
				<AbsoluteFill style={{backgroundColor: '#ff0000'}} />
			</HtmlInCanvas>
		</AbsoluteFill>
	);
};

export const elementImageOnPaintHtmlInCanvas = {
	component: ElementImageComponent,
	id: 'element-image-on-paint-html-in-canvas',
	width: 100,
	height: 100,
	fps: 30,
	durationInFrames: 5,
} as const;

export const webGlOnPaintHtmlInCanvas = {
	component: WebGlComponent,
	id: 'webgl-on-paint-html-in-canvas',
	width: 100,
	height: 100,
	fps: 30,
	durationInFrames: 5,
} as const;
