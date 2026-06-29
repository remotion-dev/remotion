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

			const fontSize = Math.min(66, Math.max(48, height * 0.78));
			const slant = getSlant();
			const font = `oblique ${slant}deg 700 ${
				fontSize * dpr
			}px GTPlanarVF, GTPlanar, sans-serif`;
			ctx.font = font;
			const measured = ctx.measureText(children).width;
			const maxWidth = pixelWidth;
			const scale = measured > maxWidth ? maxWidth / measured : 1;
			const mask = document.createElement('canvas');
			mask.width = pixelWidth;
			mask.height = pixelHeight;

			const maskCtx = mask.getContext('2d');
			if (!maskCtx) {
				return;
			}

			maskCtx.imageSmoothingEnabled = false;
			maskCtx.clearRect(0, 0, pixelWidth, pixelHeight);
			maskCtx.save();
			maskCtx.scale(scale, 1);
			maskCtx.font = font;
			maskCtx.textAlign = 'left';
			maskCtx.textBaseline = 'middle';
			maskCtx.lineJoin = 'round';
			maskCtx.lineWidth = 1;
			maskCtx.strokeStyle = '#000';
			maskCtx.fillStyle = '#000';
			maskCtx.strokeText(children, 0, pixelHeight / 2);
			maskCtx.fillText(children, 0, pixelHeight / 2);
			maskCtx.restore();

			const image = maskCtx.getImageData(0, 0, mask.width, mask.height);
			const color = colorMode === 'dark' ? '#fff' : '#000';
			ctx.fillStyle = color;
			const pixelSize = Math.max(1, Math.round(1.25 * dpr));
			const pixelGap = Math.max(1, Math.round(0.25 * dpr));
			const step = pixelSize + pixelGap;

			for (let y = 0; y < pixelHeight; y += step) {
				for (let x = 0; x < pixelWidth; x += step) {
					const samples = [
						[x + pixelSize / 2, y + pixelSize / 2],
						[x + pixelSize * 0.2, y + pixelSize * 0.2],
						[x + pixelSize * 0.8, y + pixelSize * 0.2],
						[x + pixelSize * 0.2, y + pixelSize * 0.8],
						[x + pixelSize * 0.8, y + pixelSize * 0.8],
					] as const;
					const alpha =
						samples.reduce((sum, [sampleX, sampleY]) => {
							const px = Math.min(mask.width - 1, Math.floor(sampleX));
							const py = Math.min(mask.height - 1, Math.floor(sampleY));

							return sum + image.data[(py * mask.width + px) * 4 + 3];
						}, 0) / samples.length;

					if (alpha < 128) {
						continue;
					}

					ctx.fillRect(x, y, pixelSize, pixelSize);
				}
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
