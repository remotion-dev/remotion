import React from 'react';
import {
	AbsoluteFill,
	HtmlInCanvas,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {HtmlInCanvasScene} from './scene';

export const HtmlInCanvasChangingSize: React.FC = () => {
	const frame = useCurrentFrame();
	// Animate the halftone cell size — small dots → big dots over the comp.
	const cellSize = 6;

	const size = interpolate(frame, [0, 100], [400, 1000]);

	return (
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
			<HtmlInCanvas
				width={size}
				height={size}
				onPaint={({canvas, elementImage, element}) => {
					const ctx = canvas.getContext('2d', {willReadFrequently: true});
					if (!ctx) {
						throw new Error(
							'Failed to acquire 2D context for <HtmlInCanvas> canvas',
						);
					}

					// 1. Rasterize DOM subtree, then read pixels back. This step is
					//    what makes the effect impossible in pure HTML/CSS — we need
					//    actual sampled pixel data from the rendered subtree.
					ctx.reset();
					const transform = ctx.drawElementImage(
						elementImage,
						0,
						0,
						canvas.width,
						canvas.height,
					);
					element.style.transform = transform.toString();
					const {data: pixels} = ctx.getImageData(
						0,
						0,
						canvas.width,
						canvas.height,
					);

					// 2. Repaint as a halftone dot grid with per-channel offsets:
					//    each cell samples a region's average color, then draws three
					//    overlapping circles (R/G/B) at slightly different positions.
					//    Radius scales inversely with luminance — dark = big dot.
					ctx.reset();

					const cell = Math.max(2, Math.round(cellSize));
					const maxR = (cell / 2) * Math.SQRT2;
					const offset = cell * 0.18;
					const {width, height} = canvas;

					ctx.globalCompositeOperation = 'lighter';

					for (let y = 0; y < height; y += cell) {
						for (let x = 0; x < width; x += cell) {
							let r = 0;
							let g = 0;
							let b = 0;
							let a = 0;
							let count = 0;

							const yEnd = Math.min(y + cell, height);
							const xEnd = Math.min(x + cell, width);
							for (let py = y; py < yEnd; py += 2) {
								for (let px = x; px < xEnd; px += 2) {
									const i = (py * width + px) * 4;
									r += pixels[i];
									g += pixels[i + 1];
									b += pixels[i + 2];
									a += pixels[i + 3];
									count++;
								}
							}

							if (count === 0 || a / count < 8) {
								continue;
							}

							const avgR = r / count;
							const avgG = g / count;
							const avgB = b / count;
							const luminance =
								(0.2126 * avgR + 0.7152 * avgG + 0.0722 * avgB) / 255;

							const radius = maxR * (1 - luminance);
							if (radius < 0.4) {
								continue;
							}

							const cx = x + cell / 2;
							const cy = y + cell / 2;

							ctx.fillStyle = `rgb(${avgR.toFixed(0)}, 0, 0)`;
							ctx.beginPath();
							ctx.arc(cx - offset, cy, radius, 0, Math.PI * 2);
							ctx.fill();

							ctx.fillStyle = `rgb(0, ${avgG.toFixed(0)}, 0)`;
							ctx.beginPath();
							ctx.arc(cx + offset, cy - offset, radius, 0, Math.PI * 2);
							ctx.fill();

							ctx.fillStyle = `rgb(0, 0, ${avgB.toFixed(0)})`;
							ctx.beginPath();
							ctx.arc(cx + offset, cy + offset, radius, 0, Math.PI * 2);
							ctx.fill();
						}
					}

					ctx.globalCompositeOperation = 'source-over';
				}}
			>
				<div
					style={{
						width: size,
						height: size,
						backgroundColor: '#101728',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<HtmlInCanvasScene />
				</div>
			</HtmlInCanvas>
		</AbsoluteFill>
	);
};
