import type {AnimatedImageProps} from 'remotion';
import {extractAnimatedImageFrames} from './extract-animated-image-frames';
import {
	addFrameToCache,
	aspectRatioCache,
	getAspectRatioFromCache,
	makeFrameDatabaseKey,
	mediaDurationCache,
} from './frame-database';
import {
	hydrateThumbnailsFromPersistentCache,
	writeThumbnailToPersistentCache,
} from './persistent-cache/persistent-cache';
import {
	calculateTimestampSlots,
	drawSlot,
	findBestCachedFrame,
	getCachedFrames,
	getDurationOfOneFrame,
	MAX_TIME_DEVIATION,
	WEBCODECS_TIMESCALE,
} from './render-frame-strip';
import type {RenderFrameStripToCanvasOptions} from './render-frame-strip-to-canvas';
import {resizeVideoFrame} from './resize-video-frame';
import {
	getTimelineMediaSource,
	normalizeTimelineMediaSource,
} from './timeline-media-source';

export type RenderAnimatedImageFrameStripOptions = Omit<
	RenderFrameStripToCanvasOptions,
	'signal'
> & {
	readonly signal: AbortSignal | null;
	readonly requestInit: RequestInit | null;
	readonly loopBehavior: NonNullable<AnimatedImageProps['loopBehavior']>;
	// Maps display time to image time, accounting for sequence trims and loops.
	readonly getTimestampInSeconds: (displayTimeInSeconds: number) => number;
};

export const renderAnimatedImageFrameStrip = async ({
	canvas,
	src,
	fromSeconds,
	toSeconds,
	width,
	frameHeight,
	devicePixelRatio,
	horizontalOffset,
	signal,
	requestInit,
	loopBehavior,
	getTimestampInSeconds,
}: RenderAnimatedImageFrameStripOptions): Promise<void> => {
	if (typeof ImageDecoder === 'undefined' || signal?.aborted) {
		return;
	}

	const source =
		requestInit === null
			? normalizeTimelineMediaSource(src)
			: await getTimelineMediaSource({src, requestInit});
	if (signal?.aborted) {
		return;
	}

	canvas.width = Math.max(1, Math.ceil(width + horizontalOffset));
	canvas.height = Math.max(1, Math.ceil(frameHeight * devicePixelRatio));
	const segmentDuration = toSeconds - fromSeconds;
	if (segmentDuration <= 0 || width <= 0) {
		return;
	}

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Could not get 2d context');
	}

	ctx.setTransform(1, 0, 0, 1, horizontalOffset, 0);
	let aspectRatio = getAspectRatioFromCache(source.cacheKey);
	let targets: {slot: number; timestamp: number; tolerance: number}[] | null =
		null;
	let missingTimestamps: number[] = [];
	const filledSlots = new Map<number, number | undefined>();
	const tolerances = new Map<number, number>();
	const getTargets = () => {
		if (targets !== null) {
			return targets;
		}

		aspectRatio = getAspectRatioFromCache(source.cacheKey);
		const duration = mediaDurationCache.get(source.cacheKey);
		if (aspectRatio === null || duration === undefined) {
			return null;
		}

		const slots = calculateTimestampSlots({
			visualizationWidth: width,
			fromSeconds,
			segmentDuration,
			aspectRatio,
			frameHeight: canvas.height,
		});
		const slotDuration = getDurationOfOneFrame({
			visualizationWidth: width,
			aspectRatio,
			segmentDuration,
			frameHeight: canvas.height,
		});
		const durationInMicroseconds = Math.round(duration * WEBCODECS_TIMESCALE);
		targets = slots.flatMap((slot) => {
			const time = Math.max(
				0,
				Math.round(
					getTimestampInSeconds(slot / WEBCODECS_TIMESCALE) *
						WEBCODECS_TIMESCALE,
				),
			);
			if (
				time >= durationInMicroseconds &&
				loopBehavior === 'clear-after-finish'
			) {
				return [];
			}

			const timestamp =
				duration === Infinity
					? 0
					: loopBehavior === 'loop'
						? time % durationInMicroseconds
						: Math.min(time, durationInMicroseconds - 1);
			// Measure the half-slot in source time, respecting speed and loop edges.
			const before =
				getTimestampInSeconds((slot - slotDuration / 2) / WEBCODECS_TIMESCALE) *
				WEBCODECS_TIMESCALE;
			const after =
				getTimestampInSeconds((slot + slotDuration / 2) / WEBCODECS_TIMESCALE) *
				WEBCODECS_TIMESCALE;
			const tolerance = Math.max(
				MAX_TIME_DEVIATION,
				Math.min(Math.abs(time - before), Math.abs(after - time)),
			);
			tolerances.set(
				timestamp,
				Math.max(tolerances.get(timestamp) ?? 0, tolerance),
			);
			return [{slot, timestamp, tolerance}];
		});
		return targets;
	};

	const fillFromCache = () => {
		const requests = getTargets();
		if (requests === null || aspectRatio === null) {
			return false;
		}

		const frames = getCachedFrames({
			src: source.cacheKey,
			height: canvas.height,
		});
		missingTimestamps = [];
		for (const target of requests) {
			const {entry, distance} = findBestCachedFrame({
				src: source.cacheKey,
				frames,
				timestamp: target.timestamp,
			});
			if (entry && filledSlots.get(target.slot) !== entry.frame.timestamp) {
				entry.lastUsed = Date.now();
				drawSlot({
					frame: entry.frame,
					ctx,
					filledSlots,
					visualizationWidth: width,
					timestamp: target.slot,
					segmentDuration,
					fromSeconds,
					devicePixelRatio: 1,
					frameHeight: canvas.height,
					horizontalOffset,
					aspectRatio,
					clearBeforeDraw: true,
				});
			}

			if (distance > target.tolerance) {
				missingTimestamps.push(target.timestamp);
			}
		}

		return missingTimestamps.length === 0;
	};

	try {
		// Match the video path: memory, persisted thumbnails, then decoding.
		if (fillFromCache()) {
			return;
		}

		await hydrateThumbnailsFromPersistentCache({
			src: source,
			height: canvas.height,
			getTimestamps: () =>
				getTargets()?.map((target) => target.timestamp) ?? [],
			getTimestampTolerance: (timestamp) =>
				tolerances.get(timestamp) ?? MAX_TIME_DEVIATION,
		});
		signal?.throwIfAborted();
		if (fillFromCache()) {
			return;
		}

		await extractAnimatedImageFrames({
			source,
			signal,
			timestampsInSeconds: ({track, durationInSeconds}) => {
				aspectRatioCache.set(source.cacheKey, track.width / track.height);
				if (durationInSeconds !== null) {
					mediaDurationCache.set(source.cacheKey, durationInSeconds);
				}

				targets = null;
				fillFromCache();
				return Array.from(new Set(missingTimestamps)).map(
					(timestamp) => timestamp / WEBCODECS_TIMESCALE,
				);
			},
			onFrame: (frame) => {
				const resized = resizeVideoFrame({
					frame,
					scale: canvas.height / frame.displayHeight,
				});
				const thumbnail = resized === frame ? frame.clone() : resized;
				addFrameToCache(
					makeFrameDatabaseKey(source.cacheKey, thumbnail.timestamp),
					thumbnail,
				);
				writeThumbnailToPersistentCache({src: source, frame: thumbnail});
				fillFromCache();
			},
		});
	} catch (error) {
		if (!signal?.aborted) {
			throw error;
		}
	}
};
