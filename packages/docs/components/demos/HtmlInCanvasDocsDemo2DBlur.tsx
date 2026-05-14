import React, {useCallback} from 'react';
import {
	AbsoluteFill,
	HtmlInCanvas,
	type HtmlInCanvasOnPaint,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {HtmlInCanvasDocsVideoFallback} from './HtmlInCanvasDocsVideoFallback';
import {useHtmlInCanvasDocsDemoBranch} from './useHtmlInCanvasDocsDemoBranch';

const BLUR_MIN_PX = 4;
const BLUR_MAX_PX = 22;
const BLUR_CYCLES_PER_SECOND = 0.35;

const HtmlInCanvasDocsDemo2DBlurInner: React.FC = () => {
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
				BLUR_MIN_PX +
				(BLUR_MAX_PX - BLUR_MIN_PX) * (0.5 + 0.5 * Math.sin(t));

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
				<h1 style={{margin: 0, fontSize: 120}}>Hello</h1>
			</AbsoluteFill>
		</HtmlInCanvas>
	);
};

export const HtmlInCanvasDocsDemo2DBlur: React.FC = () => {
	const branch = useHtmlInCanvasDocsDemoBranch();

	if (branch === 'pending') {
		return <AbsoluteFill style={{backgroundColor: '#1a1a2e'}} />;
	}

	if (branch === 'fallback') {
		return <HtmlInCanvasDocsVideoFallback relativeSrc="img/html-in-canvas-2d-blur.mp4" />;
	}

	return <HtmlInCanvasDocsDemo2DBlurInner />;
};
