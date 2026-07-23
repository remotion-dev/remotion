import {parseColor} from './parse-color';

const CLIPPING_COLOR = '#FF7F50';

export type WaveformVolume = number | readonly number[];

const getVolumeAtBar = ({
	barIndex,
	numBars,
	volume,
}: {
	barIndex: number;
	numBars: number;
	volume: WaveformVolume;
}) => {
	if (typeof volume === 'number') {
		return volume;
	}

	if (volume.length === 0) {
		return 1;
	}

	if (volume.length === 1 || numBars <= 1) {
		return volume[0];
	}

	const volumeIndex = Math.round(
		(barIndex / (numBars - 1)) * (volume.length - 1),
	);
	return volume[volumeIndex] ?? 1;
};

export const drawBars = ({
	canvas,
	color,
	peaks,
	volume,
	width,
}: {
	readonly canvas: HTMLCanvasElement | OffscreenCanvas;
	readonly peaks: Float32Array;
	readonly color: string;
	readonly volume: WaveformVolume;
	readonly width: number;
}) => {
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		throw new Error('Failed to get canvas context');
	}

	const {height} = canvas;
	const w = canvas.width;

	// Skip drawing when the target canvas has not been laid out yet.
	// `createImageData(0, h)` / `(w, 0)` throws a DOMException, which
	// surfaces in Studio's console for compositions with many audio
	// sequences — some segments are 0 px wide at certain zoom levels.
	if (w === 0 || height === 0) {
		return;
	}

	ctx.clearRect(0, 0, w, height);

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

		const barVolume = getVolumeAtBar({barIndex, numBars, volume});
		const scaledPeak = peak * barVolume;
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
