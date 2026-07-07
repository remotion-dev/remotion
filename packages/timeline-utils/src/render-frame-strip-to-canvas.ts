import {extractFrames} from './extract-frames';
import {
	addFrameToCache,
	aspectRatioCache,
	getAspectRatioFromCache,
	makeFrameDatabaseKey,
} from './frame-database';
import {
	ensureSlots,
	fillFrameWhereItFits,
	fillWithCachedFrames,
	WEBCODECS_TIMESCALE,
} from './render-frame-strip';
import {resizeVideoFrame} from './resize-video-frame';

type Canvas = HTMLCanvasElement | OffscreenCanvas;
type Context = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export type RenderFrameStripToCanvasOptions = {
	readonly canvas: Canvas;
	readonly src: string;
	readonly fromSeconds: number;
	readonly toSeconds: number;
	readonly width: number;
	readonly frameHeight: number;
	readonly devicePixelRatio: number;
	readonly signal?: AbortSignal;
};

const getContext = (canvas: Canvas): Context => {
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Could not get 2d context');
	}

	return ctx;
};

export const renderFrameStripToCanvas = async ({
	canvas,
	src,
	fromSeconds,
	toSeconds,
	width,
	frameHeight,
	devicePixelRatio,
	signal,
}: RenderFrameStripToCanvasOptions): Promise<void> => {
	const naturalWidth = Math.max(1, Math.ceil(width));
	const naturalHeight = Math.max(1, Math.ceil(frameHeight));
	const segmentDuration = toSeconds - fromSeconds;

	canvas.width = naturalWidth;
	canvas.height = naturalHeight;

	if (segmentDuration <= 0 || signal?.aborted) {
		return;
	}

	const ctx = getContext(canvas);
	ctx.clearRect(0, 0, naturalWidth, naturalHeight);

	const filledSlots = new Map<number, number | undefined>();
	let aspectRatio = getAspectRatioFromCache(src);

	if (aspectRatio !== null) {
		ensureSlots({
			filledSlots,
			naturalWidth,
			fromSeconds,
			toSeconds,
			aspectRatio,
			frameHeight,
		});

		fillWithCachedFrames({
			ctx,
			naturalWidth,
			filledSlots,
			src,
			segmentDuration,
			fromSeconds,
			devicePixelRatio,
			frameHeight,
		});

		const hasUnfilledSlots = Array.from(filledSlots.values()).some(
			(value) => value === undefined,
		);
		if (!hasUnfilledSlots) {
			return;
		}
	}

	await extractFrames({
		src,
		signal,
		timestampsInSeconds: ({track}) => {
			aspectRatio = track.width / track.height;
			aspectRatioCache.set(src, aspectRatio);

			ensureSlots({
				filledSlots,
				naturalWidth,
				fromSeconds,
				toSeconds,
				aspectRatio,
				frameHeight,
			});

			return Array.from(filledSlots.keys()).map(
				(timestamp) => timestamp / WEBCODECS_TIMESCALE,
			);
		},
		onVideoSample: (sample) => {
			let frame: VideoFrame | undefined;
			try {
				frame = sample.toVideoFrame();
				const scale = (frameHeight / frame.displayHeight) * devicePixelRatio;
				const transformed = resizeVideoFrame({frame, scale});

				if (transformed !== frame) {
					frame.close();
				}

				frame = undefined;

				addFrameToCache(
					makeFrameDatabaseKey(src, transformed.timestamp),
					transformed,
				);

				if (aspectRatio === null) {
					throw new Error('Aspect ratio is not set');
				}

				ensureSlots({
					filledSlots,
					naturalWidth,
					fromSeconds,
					toSeconds,
					aspectRatio,
					frameHeight,
				});

				fillFrameWhereItFits({
					ctx,
					filledSlots,
					visualizationWidth: naturalWidth,
					frame: transformed,
					segmentDuration,
					fromSeconds,
					devicePixelRatio,
					frameHeight,
				});
			} catch (e) {
				if (frame) {
					frame.close();
				}

				throw e;
			} finally {
				sample.close();
			}
		},
	});

	if (signal?.aborted) {
		return;
	}

	fillWithCachedFrames({
		ctx,
		naturalWidth,
		filledSlots,
		src,
		segmentDuration,
		fromSeconds,
		devicePixelRatio,
		frameHeight,
	});
};
