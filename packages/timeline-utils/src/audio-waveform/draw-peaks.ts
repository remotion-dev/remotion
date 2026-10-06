import {parseColor} from './parse-color';
import {getWaveformMaxima, getWaveformMaximum} from './waveform-maxima';

const CLIPPING_COLOR = '#FF7F50';
const WAVEFORM_HEIGHT_SCALE = 0.8;
const MIN_VISIBLE_DECIBELS = -37;

export type WaveformVolume = number | readonly number[];

export type WaveformDrawRange = {
	// All positions and durations use the original source's peak index units.
	readonly sourceStart: number;
	readonly sourceDuration: number;
	readonly displayStart: number;
	readonly displayDuration: number;
	readonly loop: boolean;
};

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
	range,
	volume,
	width,
	horizontalOffset,
}: {
	readonly canvas: HTMLCanvasElement | OffscreenCanvas;
	readonly peaks: Float32Array;
	readonly range: WaveformDrawRange;
	readonly color: string;
	readonly volume: WaveformVolume;
	readonly width: number;
	readonly horizontalOffset: number;
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
	if (w === 0 || height === 0 || width <= 0) {
		return;
	}

	ctx.clearRect(0, 0, w, height);

	const [r, g, b, a] = parseColor(color);
	const [cr, cg, cb, ca] = parseColor(CLIPPING_COLOR);

	const imageData = ctx.createImageData(w, height);
	const {data} = imageData;
	const numBars = width;
	const fullScaleHalfBar = (height * WAVEFORM_HEIGHT_SCALE) / 2;
	const maxima = getWaveformMaxima(peaks, null);
	const peaksPerPixel = range.displayDuration / width;
	const loopMaximum =
		range.loop && range.sourceDuration > 0
			? getWaveformMaximum({
					peaks,
					maxima,
					from: range.sourceStart,
					to: range.sourceStart + range.sourceDuration,
				})
			: 0;

	for (let x = 0; x < w; x++) {
		// The canvas may start before its fractionally positioned container so its
		// bitmap stays device-pixel aligned. Sample from the exact container origin.
		const barIndex = Math.max(
			0,
			Math.min(
				numBars - Number.EPSILON * Math.max(1, numBars),
				x - horizontalOffset,
			),
		);

		// Sample the exact source-time interval covered by this bitmap column.
		// Rounding the visible source slice and stretching it across the canvas
		// would change this mapping when a clip is trimmed or virtualized.
		const from =
			range.displayStart +
			Math.max(0, Math.min(width, x - horizontalOffset)) * peaksPerPixel;
		const to =
			range.displayStart +
			Math.max(0, Math.min(width, x + 1 - horizontalOffset)) * peaksPerPixel;
		let peak = 0;
		if (to > from && range.loop && range.sourceDuration > 0) {
			const duration = to - from;
			if (duration >= range.sourceDuration) {
				// A zoomed-out column can cover many repeats. Query the loop once,
				// without allocating or visiting every repeated source segment.
				peak = loopMaximum;
			} else {
				const loopFrom =
					((from % range.sourceDuration) + range.sourceDuration) %
					range.sourceDuration;
				const loopTo = loopFrom + duration;
				peak = getWaveformMaximum({
					peaks,
					maxima,
					from: range.sourceStart + loopFrom,
					to: range.sourceStart + Math.min(range.sourceDuration, loopTo),
				});
				if (loopTo > range.sourceDuration) {
					peak = Math.max(
						peak,
						getWaveformMaximum({
							peaks,
							maxima,
							from: range.sourceStart,
							to: range.sourceStart + loopTo - range.sourceDuration,
						}),
					);
				}
			}
		} else if (!range.loop) {
			peak = getWaveformMaximum({
				peaks,
				maxima,
				from: range.sourceStart + Math.max(0, from),
				to: range.sourceStart + Math.min(range.sourceDuration, to),
			});
		}

		const barVolume = getVolumeAtBar({barIndex, numBars, volume});
		const scaledPeak = peak * barVolume;
		const decibelPeak =
			scaledPeak <= 0 ? MIN_VISIBLE_DECIBELS : 20 * Math.log10(scaledPeak);
		const visualPeak = Math.max(
			0,
			(decibelPeak - MIN_VISIBLE_DECIBELS) / -MIN_VISIBLE_DECIBELS,
		);
		const halfBar = Math.max(
			0,
			Math.min(height / 2, visualPeak * fullScaleHalfBar),
		);
		if (halfBar === 0) continue;

		const mid = height / 2;
		const barY = Math.round(mid - halfBar);
		const barEnd = Math.round(mid + halfBar);
		const isClipping = scaledPeak > 1;
		// Color the overflow above full scale, keeping tiny overshoots visible.
		const clipTopEnd = isClipping
			? Math.min(Math.max(barY + 2, Math.round(mid - fullScaleHalfBar)), barEnd)
			: barY;
		const clipBotStart = isClipping
			? Math.max(Math.min(barEnd - 2, Math.round(mid + fullScaleHalfBar)), barY)
			: barEnd;

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
