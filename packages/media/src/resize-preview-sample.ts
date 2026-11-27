import {VideoSample} from 'mediabunny';

export type PreviewFrameResize = {
	readonly axis: 'width' | 'height';
	readonly size: number;
};

const getResizeContext = (
	context: OffscreenCanvasRenderingContext2D | null,
	width: number,
	height: number,
) => {
	if (context) {
		if (context.canvas.width !== width) context.canvas.width = width;
		if (context.canvas.height !== height) context.canvas.height = height;
		return context;
	}

	const created = new OffscreenCanvas(width, height).getContext('2d');
	if (!created) {
		throw new Error('Could not create preview resize canvas context');
	}

	return created;
};

const drawAtHalfSize = (
	target: OffscreenCanvasRenderingContext2D,
	source: OffscreenCanvas,
	width: number,
	height: number,
) => {
	target.globalCompositeOperation = 'copy';
	target.drawImage(source, 0, 0, width * 2, height * 2, 0, 0, width, height);
};

export const makePreviewSampleResizer = ({axis, size}: PreviewFrameResize) => {
	let output: OffscreenCanvasRenderingContext2D | null = null;
	let intermediate: OffscreenCanvasRenderingContext2D | null = null;

	return {
		resize: (sample: VideoSample) => {
			const {displayWidth, displayHeight} = sample;
			const aspectRatio = displayWidth / displayHeight;
			const width = axis === 'width' ? size : Math.round(size * aspectRatio);
			const height = axis === 'height' ? size : Math.round(size / aspectRatio);
			output = getResizeContext(output, width, height);
			output.imageSmoothingQuality = 'high';

			// Match Mediabunny's successive 2x downsampling for reductions beyond
			// 2x, where drawing directly into the target can alias.
			const scale = Math.min(displayWidth / width, displayHeight / height);
			const oversampling = scale > 2 ? 2 ** Math.floor(Math.log2(scale)) : 1;
			const drawWidth = width * oversampling;
			const drawHeight = height * oversampling;
			let drawContext = output;
			if (oversampling > 1) {
				intermediate = getResizeContext(intermediate, drawWidth, drawHeight);
				drawContext = intermediate;
				drawContext.imageSmoothingQuality = 'high';
			}

			drawContext.globalCompositeOperation = 'source-over';
			drawContext.clearRect(0, 0, drawWidth, drawHeight);
			sample.drawWithFit(drawContext, {fit: 'fill'});
			for (let factor = oversampling / 2; factor > 1; factor /= 2) {
				drawAtHalfSize(
					drawContext,
					drawContext.canvas,
					width * factor,
					height * factor,
				);
			}

			if (oversampling > 1) {
				drawAtHalfSize(output, drawContext.canvas, width, height);
			}

			return new VideoSample(output.canvas, {
				timestamp: sample.timestamp,
				duration: sample.duration,
				encodeOptions: sample.encodeOptions,
			});
		},
		dispose: () => {
			for (const context of [output, intermediate]) {
				if (context) {
					context.canvas.width = 0;
					context.canvas.height = 0;
				}
			}

			output = null;
			intermediate = null;
		},
	};
};
