import React from 'react';
import {AbsoluteFill, HtmlInCanvas, useVideoConfig} from 'remotion';
import {HtmlInCanvasScene} from './scene';

/** Async compose: upload via `createImageBitmap` then draw with 2D (still one frame — await keeps delayRender open). */
export const HtmlInCanvasComposeAsyncBitmap: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<AbsoluteFill style={{backgroundColor: 'red'}}>
			<HtmlInCanvas
				width={width}
				height={height}
				onPaint={async ({canvas, elementImage}) => {
					const ctx = canvas.getContext('2d');
					if (!ctx) {
						return;
					}
					ctx.reset();
					ctx.drawElementImage(elementImage, 0, 0);
					const bitmap = await createImageBitmap(canvas);
					try {
						ctx.reset();
						ctx.drawImage(bitmap, 0, 0, width, height);
					} finally {
						bitmap.close();
					}
				}}
			>
				<HtmlInCanvasScene />
			</HtmlInCanvas>
		</AbsoluteFill>
	);
};
