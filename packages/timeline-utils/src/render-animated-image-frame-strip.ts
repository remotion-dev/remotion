import type {AnimatedImageProps} from 'remotion';
import {snapCanvasPositionToDevicePixel} from './device-pixel-alignment';
import {
	addFrameToCache,
	aspectRatioCache,
	frameDatabase,
	getFrameDatabaseKeyPrefix,
	makeFrameDatabaseKey,
	mediaDurationCache,
} from './frame-database';
import {
	calculateTimestampSlots,
	getDurationOfOneFrame,
	WEBCODECS_TIMESCALE,
} from './render-frame-strip';
import type {RenderFrameStripToCanvasOptions} from './render-frame-strip-to-canvas';
import {resizeVideoFrame} from './resize-video-frame';

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
	canvas.width = Math.max(1, Math.ceil(width + horizontalOffset));
	canvas.height = Math.max(1, Math.ceil(frameHeight * devicePixelRatio));
	if (
		typeof ImageDecoder === 'undefined' ||
		signal?.aborted ||
		toSeconds <= fromSeconds ||
		width <= 0
	) {
		return;
	}

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Could not get 2d context');
	}

	ctx.setTransform(1, 0, 0, 1, horizontalOffset, 0);
	const {
		headers,
		signal: _requestSignal,
		...requestOptions
	} = requestInit ?? {};
	const cacheKey = JSON.stringify([
		'animated-image',
		src,
		requestOptions,
		headers ? Array.from(new Headers(headers).entries()) : null,
	]);
	let decoder: ImageDecoder | null = null;
	let closed = false;
	const close = () => {
		if (decoder && !closed) {
			closed = true;
			decoder.close();
		}
	};

	signal?.addEventListener('abort', close, {once: true});
	const getDecoder = async () => {
		if (decoder) {
			return decoder;
		}

		const response = await fetch(src, {
			...requestInit,
			signal: signal ?? undefined,
		});
		if (!response.ok) {
			throw new Error(`Could not load animated image: ${response.status}`);
		}

		if (!response.body) {
			throw new Error('Animated image response has no body');
		}

		signal?.throwIfAborted();
		decoder = new ImageDecoder({
			data: response.body,
			type: (response.headers.get('Content-Type') ?? 'image/gif')
				.split(';')[0]
				.trim(),
			preferAnimation: true,
		});
		await Promise.all([decoder.completed, decoder.tracks.ready]);
		return decoder;
	};

	try {
		let aspectRatio = aspectRatioCache.get(cacheKey);
		let duration = mediaDurationCache.get(cacheKey);
		if (aspectRatio === undefined || duration === undefined) {
			const imageDecoder = await getDecoder();
			const track = imageDecoder.tracks.selectedTrack;
			if (!track || track.frameCount === 0) {
				return;
			}

			const {image} = await imageDecoder.decode({
				frameIndex: track.frameCount - 1,
			});
			try {
				aspectRatio = image.displayWidth / image.displayHeight;
				duration =
					image.duration === null
						? Infinity
						: (image.timestamp + image.duration) / WEBCODECS_TIMESCALE;
				aspectRatioCache.set(cacheKey, aspectRatio);
				mediaDurationCache.set(cacheKey, duration);
			} finally {
				image.close();
			}
		}

		const segmentDuration = toSeconds - fromSeconds;
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
		const prefix = getFrameDatabaseKeyPrefix(cacheKey);
		const durationInMicroseconds = Math.round(duration * WEBCODECS_TIMESCALE);
		const frameTimes = new Map<number, {start: number; end: number}>();
		for (const slot of slots) {
			signal?.throwIfAborted();
			// Match the decoder's integer timebase at exact frame/loop boundaries.
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
				continue;
			}

			const timestamp =
				duration === Infinity
					? 0
					: loopBehavior === 'loop'
						? time % durationInMicroseconds
						: Math.min(time, durationInMicroseconds - 1);
			let frame: VideoFrame | null = null;
			for (const [key, cached] of frameDatabase) {
				if (
					key.startsWith(prefix) &&
					cached.frame.displayHeight === canvas.height &&
					cached.frame.timestamp <= timestamp &&
					(cached.frame.duration === null ||
						timestamp < cached.frame.timestamp + cached.frame.duration)
				) {
					frame = cached.frame;
					cached.lastUsed = Date.now();
					break;
				}
			}

			if (!frame) {
				const imageDecoder = await getDecoder();
				let low = 0;
				let high = (imageDecoder.tracks.selectedTrack?.frameCount ?? 0) - 1;
				// Frame delays may vary, so search by decoded timestamps, not FPS.
				while (low <= high) {
					signal?.throwIfAborted();
					const index = Math.floor((low + high) / 2);
					const knownTime = frameTimes.get(index);
					if (knownTime && timestamp < knownTime.start) {
						high = index - 1;
						continue;
					}

					if (knownTime && timestamp >= knownTime.end) {
						low = index + 1;
						continue;
					}

					const {image} = await imageDecoder.decode({frameIndex: index});
					try {
						const start = image.timestamp;
						const end = start + (image.duration ?? Infinity);
						frameTimes.set(index, {start, end});
						if (timestamp < start) {
							high = index - 1;
						} else if (timestamp >= end) {
							low = index + 1;
						} else {
							frame = resizeVideoFrame({
								frame: image,
								scale: canvas.height / image.displayHeight,
							});
							if (frame === image) {
								frame = image.clone();
							}

							addFrameToCache(makeFrameDatabaseKey(cacheKey, start), frame);
							break;
						}
					} finally {
						image.close();
					}
				}
			}

			if (!frame || signal?.aborted) {
				continue;
			}

			const thumbnailWidth = canvas.height * aspectRatio;
			const position =
				((slot - fromSeconds * WEBCODECS_TIMESCALE) / slotDuration) *
				thumbnailWidth;
			const left = snapCanvasPositionToDevicePixel({
				horizontalOffset,
				position,
			});
			const right = snapCanvasPositionToDevicePixel({
				horizontalOffset,
				position: position + thumbnailWidth,
			});
			ctx.drawImage(frame, left, 0, right - left, canvas.height);
		}
	} catch (error) {
		if (!signal?.aborted) {
			throw error;
		}
	} finally {
		signal?.removeEventListener('abort', close);
		close();
	}
};
