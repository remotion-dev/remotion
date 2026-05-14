import React, {useCallback} from 'react';
import {
	AbsoluteFill,
	HtmlInCanvas,
	type HtmlInCanvasOnPaint,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

/** Pixels — blur oscillates between these bounds. */
const BLUR_MIN_PX = 4;
const BLUR_MAX_PX = 22;
/** Blur animation speed (full sine cycles per second). */
const BLUR_CYCLES_PER_SECOND = 0.35;

/**
 * 2D `ctx.filter` blur that varies with [`useCurrentFrame()`](/docs/use-current-frame), plus
 * `drawElementImage` — see docs “onPaint examples → 2D”.
 * Composition id: `html-in-canvas-docs-demo-2d-blur`.
 */
export const HtmlInCanvasDocsDemo2DBlur: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height, fps} = useVideoConfig();

	const onPaint: HtmlInCanvasOnPaint = useCallback(
		({canvas, element, elementImage}) => {
			const ctx = canvas.getContext('2d');
			if (!ctx) {
				throw new Error('Failed to acquire 2D context');
			}

			const t = (frame / fps) * Math.PI * 2 * BLUR_CYCLES_PER_SECOND;
			const blurPx =
				BLUR_MIN_PX + (BLUR_MAX_PX - BLUR_MIN_PX) * (0.5 + 0.5 * Math.sin(t));

			ctx.reset();
			ctx.filter = `blur(${blurPx}px)`;
			const transform = ctx.drawElementImage(elementImage, 0, 0);
			element.style.transform = transform.toString();
		},
		[frame, fps],
	);

	return (
		<HtmlInCanvas width={width} height={height} onPaint={onPaint}>
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: '#1a1a2e',
					color: 'white',
					fontSize: 120,
					fontFamily: 'sans-serif',
				}}
			>
				<h1 style={{margin: 0}}>Hello</h1>
			</AbsoluteFill>
		</HtmlInCanvas>
	);
};
