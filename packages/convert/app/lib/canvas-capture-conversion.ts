import {resolveCursor} from '@remotion/mac-cursors';
import {VideoSample, type CropRectangle} from 'mediabunny';
import type {Dimensions} from './calculate-new-dimensions-from-dimensions';
import {normalizeVideoRotation} from './calculate-new-dimensions-from-dimensions';
import type {CanvasCaptureCursorData} from './canvas-capture-metadata';
import {
	findCanvasCaptureCursorAtTime,
	isCanvasCapturePointerDownAtTime,
} from './canvas-capture-metadata';

export const CURSOR_SAMPLE_MERGE_THRESHOLD_IN_SECONDS = 0.001;

export type CanvasCaptureSampleMoment = {
	readonly timestamp: number;
	readonly cursorLookupTimestamp: number;
	readonly duration: number;
};

export const getCanvasCaptureSampleMoments = ({
	timestamp,
	duration,
	cursorStateChanges,
}: {
	readonly timestamp: number;
	readonly duration: number;
	readonly cursorStateChanges: readonly {readonly timeInSeconds: number}[];
}): CanvasCaptureSampleMoment[] => {
	const endTimestamp = timestamp + duration;
	const moments: Array<Omit<CanvasCaptureSampleMoment, 'duration'>> = [
		{timestamp, cursorLookupTimestamp: timestamp},
	];
	let low = 0;
	let high = cursorStateChanges.length;
	while (low < high) {
		const middle = Math.floor((low + high) / 2);
		if (cursorStateChanges[middle].timeInSeconds < timestamp) {
			low = middle + 1;
		} else {
			high = middle;
		}
	}

	for (let index = low; index < cursorStateChanges.length; index++) {
		const stateChange = cursorStateChanges[index];
		if (stateChange.timeInSeconds >= endTimestamp) {
			break;
		}

		const previousMoment = moments[moments.length - 1];
		if (
			stateChange.timeInSeconds - previousMoment.timestamp <=
			CURSOR_SAMPLE_MERGE_THRESHOLD_IN_SECONDS
		) {
			moments[moments.length - 1] = {
				...previousMoment,
				cursorLookupTimestamp: stateChange.timeInSeconds,
			};
			continue;
		}

		if (
			endTimestamp - stateChange.timeInSeconds <=
			CURSOR_SAMPLE_MERGE_THRESHOLD_IN_SECONDS
		) {
			continue;
		}

		moments.push({
			timestamp: stateChange.timeInSeconds,
			cursorLookupTimestamp: stateChange.timeInSeconds,
		});
	}

	return moments.map((moment, index) => ({
		...moment,
		duration:
			(index === moments.length - 1
				? endTimestamp
				: moments[index + 1].timestamp) - moment.timestamp,
	}));
};

export const rotateCanvasCapturePoint = ({
	x,
	y,
	dimensions,
	rotation,
}: {
	readonly x: number;
	readonly y: number;
	readonly dimensions: Dimensions;
	readonly rotation: number;
}) => {
	const normalizedRotation = normalizeVideoRotation(rotation);
	if (normalizedRotation === 0) {
		return {x, y};
	}

	if (normalizedRotation === 90) {
		return {x: dimensions.height - y, y: x};
	}

	if (normalizedRotation === 180) {
		return {x: dimensions.width - x, y: dimensions.height - y};
	}

	if (normalizedRotation === 270) {
		return {x: y, y: dimensions.width - x};
	}

	throw new Error(`Unsupported rotation: ${rotation}`);
};

export const mapCanvasCapturePointToSample = ({
	x,
	y,
	sourceDimensions,
	rotation,
	crop,
	sampleDimensions,
}: {
	readonly x: number;
	readonly y: number;
	readonly sourceDimensions: Dimensions;
	readonly rotation: number;
	readonly crop: CropRectangle | null;
	readonly sampleDimensions: Dimensions;
}) => {
	const rotatedPoint = rotateCanvasCapturePoint({
		x,
		y,
		dimensions: sourceDimensions,
		rotation,
	});
	const rotatedDimensions =
		normalizeVideoRotation(rotation) % 180 === 0
			? sourceDimensions
			: {width: sourceDimensions.height, height: sourceDimensions.width};
	const visibleRectangle =
		crop ?? ({left: 0, top: 0, ...rotatedDimensions} satisfies CropRectangle);

	return {
		x:
			((rotatedPoint.x - visibleRectangle.left) / visibleRectangle.width) *
			sampleDimensions.width,
		y:
			((rotatedPoint.y - visibleRectangle.top) / visibleRectangle.height) *
			sampleDimensions.height,
	};
};

export const getCanvasCaptureScaleToSample = ({
	sourceDimensions,
	rotation,
	crop,
	sampleWidth,
}: {
	readonly sourceDimensions: Dimensions;
	readonly rotation: number;
	readonly crop: CropRectangle | null;
	readonly sampleWidth: number;
}) => {
	const rotatedWidth =
		normalizeVideoRotation(rotation) % 180 === 0
			? sourceDimensions.width
			: sourceDimensions.height;

	return sampleWidth / (crop?.width ?? rotatedWidth);
};

export const makeCanvasCaptureVideoProcessor = ({
	cursorData,
	cursorScale,
	cursorPressedScale,
	sourceDimensions,
	rotation,
	crop,
	mirrorHorizontal,
	mirrorVertical,
	timestampOffset,
}: {
	readonly cursorData: CanvasCaptureCursorData;
	readonly cursorScale: number;
	readonly cursorPressedScale: number;
	readonly sourceDimensions: Dimensions;
	readonly rotation: number;
	readonly crop: CropRectangle | null;
	readonly mirrorHorizontal: boolean;
	readonly mirrorVertical: boolean;
	readonly timestampOffset: number;
}) => {
	const mouseMovements = cursorData.mouseMovements.map((movement) => ({
		...movement,
		timeInSeconds: movement.timeInSeconds - timestampOffset,
	}));
	const pointerClicks = cursorData.pointerClicks.map((click) => ({
		...click,
		timeInSeconds: click.timeInSeconds - timestampOffset,
	}));
	const cursorStateChanges = [...mouseMovements, ...pointerClicks].sort(
		(a, b) => a.timeInSeconds - b.timeInSeconds,
	);
	const imageCache = new Map<string, Promise<HTMLImageElement>>();

	const loadImage = (src: string) => {
		let image = imageCache.get(src);
		if (!image) {
			image = new Promise((resolve, reject) => {
				const cursorImage = new Image();
				cursorImage.onload = () => resolve(cursorImage);
				cursorImage.onerror = () => {
					reject(new Error('Could not decode cursor image'));
				};

				cursorImage.src = src;
			});
			imageCache.set(src, image);
		}

		return image;
	};

	return {
		process: async (sample: VideoSample) => {
			const moments = getCanvasCaptureSampleMoments({
				timestamp: sample.timestamp,
				duration: sample.duration,
				cursorStateChanges,
			});
			const sourceFrame = sample.toVideoFrame();
			const outputSamples: VideoSample[] = [];

			try {
				for (const moment of moments) {
					const canvas = new OffscreenCanvas(
						sample.displayWidth,
						sample.displayHeight,
					);
					const context = canvas.getContext('2d');
					if (!context) {
						throw new Error('Could not get 2D canvas context');
					}

					context.translate(
						mirrorHorizontal ? sample.displayWidth : 0,
						mirrorVertical ? sample.displayHeight : 0,
					);
					context.scale(mirrorHorizontal ? -1 : 1, mirrorVertical ? -1 : 1);
					context.drawImage(
						sourceFrame,
						0,
						0,
						sample.displayWidth,
						sample.displayHeight,
					);

					const cursor = findCanvasCaptureCursorAtTime(
						mouseMovements,
						moment.cursorLookupTimestamp,
					);
					if (cursor && cursor.canvasX !== null && cursor.canvasY !== null) {
						const resolvedCursor = resolveCursor(cursor.cursor);
						if (resolvedCursor) {
							const image = await loadImage(resolvedCursor.src);
							const point = mapCanvasCapturePointToSample({
								x: cursor.canvasX,
								y: cursor.canvasY,
								sourceDimensions,
								rotation,
								crop,
								sampleDimensions: {
									width: sample.displayWidth,
									height: sample.displayHeight,
								},
							});
							const scale =
								cursorData.captureMetadata.density *
								cursorScale *
								(isCanvasCapturePointerDownAtTime(
									pointerClicks,
									moment.cursorLookupTimestamp,
								)
									? cursorPressedScale
									: 1) *
								getCanvasCaptureScaleToSample({
									sourceDimensions,
									rotation,
									crop,
									sampleWidth: sample.displayWidth,
								});
							const width =
								(resolvedCursor.width ?? image.naturalWidth) * scale;
							const height =
								(resolvedCursor.height ?? image.naturalHeight) * scale;
							context.drawImage(
								image,
								point.x - resolvedCursor.hotspot.x * scale,
								point.y - resolvedCursor.hotspot.y * scale,
								width,
								height,
							);
						}
					}

					outputSamples.push(
						new VideoSample(canvas, {
							timestamp: moment.timestamp,
							duration: moment.duration,
						}),
					);
				}
			} finally {
				sourceFrame.close();
			}

			return outputSamples;
		},
		dispose: async () => {
			await Promise.allSettled(imageCache.values());
			imageCache.clear();
		},
	};
};
