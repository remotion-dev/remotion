import {parseColor} from './parse-color';

const CLIPPING_COLOR = '#FF7F50';

export const drawBars = (
	canvas: HTMLCanvasElement,
	peaks: Float32Array,
	color: string,
	volume: number,
	width: number,
) => {
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		throw new Error('Failed to get canvas context');
	}

	const {height} = canvas;
	const w = canvas.width;

	ctx.clearRect(0, 0, w, height);

	if (volume === 0) return;

	const [r, g, b, a] = parseColor(color);
	const [cr, cg, cb, ca] = parseColor(CLIPPING_COLOR);

	const imageData = ctx.createImageData(w, height);
	const {data} = imageData;
	const numBars = width;

	for (let barIndex = 0; barIndex < numBars; barIndex++) {
		const x = barIndex;
		if (x >= w) break;

		const peakIndex = Math.floor((barIndex / numBars) * peaks.length);
		const peak = peaks[peakIndex] || 0;

		const scaledPeak = peak * volume;
		const halfBar = Math.max(
			0,
			Math.min(height / 2, (scaledPeak * height) / 2),
		);
		if (halfBar === 0) continue;

		const mid = height / 2;
		const barY = Math.round(mid - halfBar);
		const barEnd = Math.round(mid + halfBar);
		const isClipping = scaledPeak > 1;
		const clipTopEnd = isClipping ? Math.min(barY + 2, barEnd) : barY;
		const clipBotStart = isClipping ? Math.max(barEnd - 2, barY) : barEnd;

		for (let y = barY; y < clipTopEnd; y++) {
			const idx = (y * w + x) * 4;
			data[idx] = cr;
			data[idx + 1] = cg;
			data[idx + 2] = cb;
			data[idx + 3] = ca;
		}

		for (let y = clipTopEnd; y < clipBotStart; y++) {
			const idx = (y * w + x) * 4;
			data[idx] = r;
			data[idx + 1] = g;
			data[idx + 2] = b;
			data[idx + 3] = a;
		}

		for (let y = clipBotStart; y < barEnd; y++) {
			const idx = (y * w + x) * 4;
			data[idx] = cr;
			data[idx + 1] = cg;
			data[idx + 2] = cb;
			data[idx + 3] = ca;
		}
	}

	ctx.putImageData(imageData, 0, 0);
};
