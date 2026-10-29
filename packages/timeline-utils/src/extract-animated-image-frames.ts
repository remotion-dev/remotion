import {Internals} from 'remotion';
import type {ExtractFramesProps} from './extract-frames';
import {WEBCODECS_TIMESCALE} from './render-frame-strip';
import type {TimelineMediaSource} from './timeline-media-source';

type AnimatedImageInput = {
	readonly ready: Promise<{
		decoder: ImageDecoder;
		frameCount: number;
		width: number;
		height: number;
		durationInSeconds: number;
		container: string;
	}>;
	readonly frameTimes: Map<number, {start: number; end: number}>;
};

export const extractAnimatedImageFrames = async ({
	source,
	timestampsInSeconds,
	onFrame,
	signal,
}: {
	source: TimelineMediaSource;
	timestampsInSeconds: ExtractFramesProps['timestampsInSeconds'];
	// The frame is closed after the callback, so retained frames must be cloned.
	onFrame: (frame: VideoFrame) => void;
	signal: AbortSignal | null;
}) => {
	if (typeof ImageDecoder === 'undefined' || signal?.aborted) {
		return;
	}

	const lease =
		Internals.globalMediaResourceManager.acquire<AnimatedImageInput>({
			key: JSON.stringify(['image-decoder', source.cacheKey]),
			create: () => {
				const controller = new AbortController();
				let decoder: ImageDecoder | null = null;
				const frameTimes = new Map<number, {start: number; end: number}>();
				const ready = (async () => {
					const response = await fetch(source.src, {
						...source.requestInit,
						signal: controller.signal,
					});
					if (!response.ok || !response.body) {
						throw new Error(
							`Could not load animated image: ${response.status}`,
						);
					}

					const container = (
						response.headers.get('Content-Type') ?? 'image/gif'
					)
						.split(';')[0]
						.trim();
					controller.signal.throwIfAborted();
					decoder = new ImageDecoder({
						data: response.body,
						type: container,
						preferAnimation: true,
					});
					await Promise.all([decoder.completed, decoder.tracks.ready]);
					const track = decoder.tracks.selectedTrack;
					if (!track || track.frameCount === 0) {
						throw new Error('Animated image has no frames');
					}

					const {image} = await decoder.decode({
						frameIndex: track.frameCount - 1,
					});
					try {
						const end = image.timestamp + (image.duration ?? Infinity);
						frameTimes.set(track.frameCount - 1, {start: image.timestamp, end});
						return {
							decoder,
							frameCount: track.frameCount,
							width: image.displayWidth,
							height: image.displayHeight,
							durationInSeconds: end / WEBCODECS_TIMESCALE,
							container,
						};
					} finally {
						image.close();
					}
				})();
				return {
					resource: {ready, frameTimes},
					dispose: () => {
						controller.abort();
						decoder?.close();
					},
				};
			},
		});
	// An aborted subscriber releases its lease without closing another user's
	// decoder, just like shared Mediabunny inputs used for video thumbnails.
	signal?.addEventListener('abort', lease.release, {once: true});
	try {
		const {decoder, frameCount, width, height, durationInSeconds, container} =
			await lease.resource.ready;
		if (signal?.aborted) {
			return;
		}

		const timestamps =
			typeof timestampsInSeconds === 'function'
				? await timestampsInSeconds({
						track: {width, height},
						durationInSeconds,
						container,
					})
				: timestampsInSeconds;
		for (const time of timestamps) {
			signal?.throwIfAborted();
			const timestamp = Math.round(time * WEBCODECS_TIMESCALE);
			let low = 0;
			let high = frameCount - 1;
			while (low <= high) {
				signal?.throwIfAborted();
				const index = Math.floor((low + high) / 2);
				const knownTime = lease.resource.frameTimes.get(index);
				if (knownTime && timestamp < knownTime.start) {
					high = index - 1;
					continue;
				}

				if (knownTime && timestamp >= knownTime.end) {
					low = index + 1;
					continue;
				}

				const {image} = await decoder.decode({frameIndex: index});
				try {
					const start = image.timestamp;
					const end = start + (image.duration ?? Infinity);
					lease.resource.frameTimes.set(index, {start, end});
					if (timestamp < start) {
						high = index - 1;
					} else if (timestamp >= end) {
						low = index + 1;
					} else {
						if (!signal?.aborted) {
							onFrame(image);
						}

						break;
					}
				} finally {
					image.close();
				}
			}
		}
	} catch (error) {
		if (!signal?.aborted) {
			throw error;
		}
	} finally {
		signal?.removeEventListener('abort', lease.release);
		lease.release();
	}
};
