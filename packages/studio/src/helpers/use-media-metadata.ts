import {getVideoMetadata} from '@remotion/media-utils';
import {
	readMediaMetadataFromPersistentCache,
	writeMediaMetadataToPersistentCache,
} from '@remotion/timeline-utils';
import type {
	FrameRateMetrics,
	InputAudioTrack,
	InputVideoTrack,
} from 'mediabunny';
import {ALL_FORMATS, Input, MATROSKA, UrlSource, WEBM} from 'mediabunny';
import {useEffect, useState} from 'react';
import {Internals} from 'remotion';
import {getDurationOrCompute} from './get-duration-or-compute';

// Persisted by the timeline cache of @remotion/timeline-utils. Bump its
// SCHEMA_VERSION when changing this type.
export type MediaMetadata = {
	duration: number;
	videoTiming: {
		durationInFrames: number | null;
		startTime: number;
		timeResolution: number;
		frameRateIsConstant: boolean;
	} | null;
	format: string | null;
	width: number | null;
	height: number | null;
	videoCodec: InputVideoTrack['codec'] | null;
	audioCodec: InputAudioTrack['codec'] | null;
	fps: number | null;
	isHdr: boolean | null;
	sampleRate: number | null;
	hasVideoTrack: boolean | null;
	hasAudioTrack: boolean | null;
};

const cache = new Map<string, MediaMetadata>();
const pendingRequests = new Map<string, Promise<MediaMetadata | null>>();
const frameRateProbeSize = 256;

export const getMediaDurationInFrames = (duration: number, fps: number) => {
	const frames = duration * fps;
	return Math.max(1, Math.ceil(frames - Number.EPSILON * frames));
};

export const getMediaPreviewClock = (metadata: MediaMetadata | null) => {
	const fps = metadata?.fps;
	return {
		fps: fps && Number.isFinite(fps) && fps > 0 ? fps : 30,
		videoTiming: metadata?.videoTiming ?? null,
	};
};

export const getFrameRateFromMetrics = (
	metrics: Pick<
		FrameRateMetrics,
		'bestGuessFrameRate' | 'probedPacketCount'
	> | null,
) => {
	if (
		metrics === null ||
		metrics.probedPacketCount < 2 ||
		!Number.isFinite(metrics.bestGuessFrameRate) ||
		metrics.bestGuessFrameRate <= 0
	) {
		return null;
	}

	return metrics.bestGuessFrameRate;
};

export const getCachedMediaMetadata = (src: string) => {
	return cache.get(src) ?? null;
};

const safeCall = async <T>(fn: () => Promise<T>): Promise<T | null> => {
	try {
		return await fn();
	} catch {
		return null;
	}
};

const getVideoFrameCount = (
	duration: number | null,
	fps: number,
	frameRateIsConstant: boolean,
) => {
	if (duration === null || !Number.isFinite(duration) || duration <= 0)
		return null;
	return frameRateIsConstant
		? Math.max(1, Math.round(duration * fps))
		: getMediaDurationInFrames(duration, fps);
};

const acquireMetadataInput = (src: string) => {
	try {
		return Internals.globalMediaResourceManager.acquire<Input>({
			key: Internals.getMediabunnyInputResourceKey({
				src,
				credentials: null,
				requestInitFingerprint: null,
				revision: null,
			}),
			create: () => {
				const createdInput = new Input({
					formats: ALL_FORMATS,
					source: new UrlSource(src, {
						handleUnhandledError: (error) => {
							Internals.Log.warn(
								{logLevel: 'info', tag: '@remotion/studio'},
								`A speculative fetch for "${src}" failed:`,
								error,
							);
						},
					}),
				});

				return {
					resource: createdInput,
					dispose: () => createdInput.dispose(),
				};
			},
		});
	} catch {
		return null;
	}
};

const getMediabunnyMetadata = async (
	src: string,
): Promise<MediaMetadata | null> => {
	const lease = acquireMetadataInput(src);

	if (lease === null) {
		return null;
	}

	const input = lease.resource;

	try {
		const [duration, format, videoTrack, audioTrack] = await Promise.all([
			safeCall(() =>
				lease.getOrCreateValue(Internals.MEDIABUNNY_DURATION_VALUE_KEY, () =>
					getDurationOrCompute(input),
				),
			),
			safeCall(() => input.getFormat()),
			safeCall(() => input.getPrimaryVideoTrack()),
			safeCall(() => input.getPrimaryAudioTrack()),
		]);

		if (duration === null) {
			return null;
		}

		const [
			width,
			height,
			videoCodec,
			frameRateMetrics,
			isHdr,
			audioCodec,
			sampleRate,
		] = await Promise.all([
			videoTrack ? safeCall(() => videoTrack.getDisplayWidth()) : null,
			videoTrack ? safeCall(() => videoTrack.getDisplayHeight()) : null,
			videoTrack ? safeCall(() => videoTrack.getCodec()) : null,
			videoTrack
				? safeCall(() =>
						videoTrack.computeFrameRateMetrics({
							targetPacketCount: frameRateProbeSize,
						}),
					)
				: null,
			videoTrack ? safeCall(() => videoTrack.hasHighDynamicRange()) : null,
			audioTrack ? safeCall(() => audioTrack.getCodec()) : null,
			audioTrack ? safeCall(() => audioTrack.getSampleRate()) : null,
		]);

		const fps = getFrameRateFromMetrics(frameRateMetrics);
		let videoTiming: MediaMetadata['videoTiming'] = null;
		if (
			videoTrack &&
			frameRateMetrics &&
			frameRateMetrics.probedPacketCount > 0
		) {
			const {frameRateIsConstant, probedPacketCount} = frameRateMetrics;
			const [end, timeResolution, firstTimestamp] = await Promise.all([
				// Matroska can store the same segment duration for every track.
				probedPacketCount < frameRateProbeSize
					? safeCall(() => videoTrack.computeDuration({skipLiveWait: true}))
					: format === MATROSKA || format === WEBM
						? null
						: safeCall(() =>
								videoTrack.getDurationFromMetadata({skipLiveWait: true}),
							),
				safeCall(() => videoTrack.getTimeResolution()),
				safeCall(() => videoTrack.getFirstTimestamp()),
			]);
			if (
				timeResolution !== null &&
				Number.isFinite(timeResolution) &&
				timeResolution > 0
			) {
				const startTime = Math.max(0, firstTimestamp ?? 0);
				videoTiming = {
					durationInFrames: getVideoFrameCount(
						end === null ? null : end - startTime,
						fps ?? 30,
						frameRateIsConstant,
					),
					startTime,
					timeResolution,
					frameRateIsConstant,
				};
			}
		}

		return {
			duration,
			videoTiming,
			format: format?.name ?? null,
			width,
			height,
			videoCodec,
			audioCodec,
			fps,
			isHdr,
			sampleRate,
			hasVideoTrack: Boolean(videoTrack),
			hasAudioTrack: Boolean(audioTrack),
		};
	} finally {
		lease.release();
	}
};

const getFallbackVideoMetadata = async (
	src: string,
): Promise<MediaMetadata | null> => {
	try {
		const metadata = await getVideoMetadata(src);

		return {
			duration: metadata.durationInSeconds,
			videoTiming: null,
			format: null,
			width: metadata.width,
			height: metadata.height,
			videoCodec: null,
			audioCodec: null,
			fps: null,
			isHdr: null,
			sampleRate: null,
			hasVideoTrack: null,
			hasAudioTrack: null,
		};
	} catch {
		return null;
	}
};

export const getMediaMetadata = (
	src: string,
): Promise<MediaMetadata | null> => {
	const cached = cache.get(src);

	if (cached) {
		return Promise.resolve(cached);
	}

	const pendingRequest = pendingRequests.get(src);

	if (pendingRequest) {
		return pendingRequest;
	}

	// The timeline can only draw a media clip once its duration is known, so
	// metadata from a previous page load avoids waiting for the network.
	const request = readMediaMetadataFromPersistentCache(src)
		.then(async (persisted) => {
			if (persisted) {
				return persisted as MediaMetadata;
			}

			const metadata =
				(await getMediabunnyMetadata(src).catch(() => null)) ??
				(await getFallbackVideoMetadata(src));
			if (metadata) {
				writeMediaMetadataToPersistentCache({src, mediaMetadata: metadata});
			}

			return metadata;
		})
		.then((metadata) => {
			if (metadata) {
				cache.set(src, metadata);
			}

			return metadata;
		})
		.finally(() => {
			pendingRequests.delete(src);
		});

	pendingRequests.set(src, request);

	return request;
};

export const getRenderOutputVideoClock = async (
	src: string,
	signal: AbortSignal,
) => {
	const metadata = await getMediaMetadata(src);
	const clock = getMediaPreviewClock(metadata);
	const timing = clock.videoTiming;
	if (
		!metadata ||
		!timing ||
		timing.durationInFrames !== null ||
		signal.aborted
	)
		return clock;

	const lease = acquireMetadataInput(src);
	if (!lease) return clock;
	signal.addEventListener('abort', lease.release, {once: true});
	try {
		const end = await safeCall(() =>
			lease.getOrCreateValue('studio-output-video-end', async () => {
				const track = await lease.resource.getPrimaryVideoTrack();
				return track ? track.computeDuration({skipLiveWait: true}) : null;
			}),
		);
		const durationInFrames = getVideoFrameCount(
			end === null ? null : end - timing.startTime,
			clock.fps,
			timing.frameRateIsConstant,
		);
		if (durationInFrames === null || signal.aborted) return clock;
		const updated = {...metadata, videoTiming: {...timing, durationInFrames}};
		cache.set(src, updated);
		writeMediaMetadataToPersistentCache({src, mediaMetadata: updated});
		return getMediaPreviewClock(updated);
	} finally {
		signal.removeEventListener('abort', lease.release);
		lease.release();
	}
};

export const useMediaMetadata = (src: string | null): MediaMetadata | null => {
	const resolvedSrc = Internals.usePreload(src ?? '');
	const metadataSrc = src === null ? null : resolvedSrc;
	const [state, setState] = useState(() => ({
		src: metadataSrc,
		metadata: metadataSrc ? getCachedMediaMetadata(metadataSrc) : null,
	}));

	useEffect(() => {
		const cached = metadataSrc ? getCachedMediaMetadata(metadataSrc) : null;
		setState({src: metadataSrc, metadata: cached});

		if (!metadataSrc || cached) {
			return;
		}

		let cancelled = false;

		getMediaMetadata(metadataSrc)
			.then((metadata) => {
				if (cancelled) {
					return;
				}

				setState({src: metadataSrc, metadata});
			})
			.catch(() => {
				if (cancelled) {
					return;
				}

				setState({src: metadataSrc, metadata: null});
			});

		return () => {
			cancelled = true;
		};
	}, [metadataSrc]);

	// A changed source must not borrow the previous source's duration for a render.
	return state.src === metadataSrc ? state.metadata : null;
};
