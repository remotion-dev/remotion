import React, {useEffect, useRef} from 'react';
import {useColorMode} from './layout/use-color-mode';

export const CanvasSectionTitle: React.FC<{
	readonly children: string;
}> = ({children}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const {colorMode} = useColorMode();

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		let animationFrame = 0;
		const getSlant = () => {
			const rect = canvas.getBoundingClientRect();
			const viewportHeight =
				window.innerHeight || document.documentElement.clientHeight;
			const center = rect.top + rect.height / 2;
			const straightZoneTop = viewportHeight * 0.25;
			const straightZoneBottom = viewportHeight * 0.75;

			if (center >= straightZoneTop && center <= straightZoneBottom) {
				return 0;
			}

			const distance =
				center < straightZoneTop
					? straightZoneTop - center
					: center - straightZoneBottom;
			const maxDistance =
				center < straightZoneTop
					? straightZoneTop
					: viewportHeight - straightZoneBottom;
			const progress = Math.min(1, distance / maxDistance);

			return progress * -45;
		};

		const draw = () => {
			const rect = canvas.getBoundingClientRect();
			const dpr = window.devicePixelRatio || 1;
			const width = Math.max(1, rect.width);
			const height = Math.max(1, rect.height);
			const pixelWidth = Math.floor(width * dpr);
			const pixelHeight = Math.floor(height * dpr);

			canvas.width = pixelWidth;
			canvas.height = pixelHeight;

			const ctx = canvas.getContext('2d');
			if (!ctx) {
				return;
			}

			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.imageSmoothingEnabled = false;
			ctx.clearRect(0, 0, pixelWidth, pixelHeight);

			const fontSize = 36;
			const slant = getSlant();
			const font = `oblique ${slant}deg 700 ${
				fontSize * dpr
			}px GTPlanarVF, GTPlanar, sans-serif`;
			ctx.font = font;
			const textMetrics = ctx.measureText(children);
			const visualWidth =
				textMetrics.actualBoundingBoxLeft + textMetrics.actualBoundingBoxRight;
			const measured = visualWidth || textMetrics.width;
			const maxWidth = pixelWidth;
			const scale = measured > maxWidth ? maxWidth / measured : 1;
			const color = colorMode === 'dark' ? '#fff' : '#000';
			const dotSize = Math.max(1, Math.round(1.25 * dpr));
			const dotGap = Math.max(1, Math.round(0.25 * dpr));
			const step = dotSize + dotGap;
			const borderY = pixelHeight - dotSize;
			const textGap = Math.round(8 * dpr);
			const textBaseline =
				borderY - textGap - textMetrics.actualBoundingBoxDescent;

			ctx.fillStyle = color;
			ctx.save();
			ctx.translate(pixelWidth / 2, 0);
			ctx.scale(scale, 1);
			ctx.font = font;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'alphabetic';
			ctx.fillText(children, 0, textBaseline);
			ctx.restore();

			for (let x = 0; x < pixelWidth; x += step) {
				ctx.fillRect(x, borderY, dotSize, dotSize);
			}
		};

		const scheduleDraw = () => {
			cancelAnimationFrame(animationFrame);
			animationFrame = requestAnimationFrame(draw);
		};

		const resizeObserver = new ResizeObserver(scheduleDraw);
		resizeObserver.observe(canvas);
		document.fonts
			?.load('oblique 0deg 700 60px GTPlanarVF')
			.then(scheduleDraw)
			.catch(() => undefined);
		window.addEventListener('scroll', scheduleDraw, {passive: true});
		window.addEventListener('resize', scheduleDraw);
		scheduleDraw();

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener('scroll', scheduleDraw);
			window.removeEventListener('resize', scheduleDraw);
			cancelAnimationFrame(animationFrame);
		};
	}, [children, colorMode]);

	return (
		<canvas
			ref={canvasRef}
			aria-label={children}
			className="block h-20 w-full"
			role="img"
		/>
	);
};
