import {getVideoMetadata} from '@remotion/media-utils';
import type {
	FrameRateMetrics,
	InputAudioTrack,
	InputVideoTrack,
} from 'mediabunny';
import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import {useEffect, useState} from 'react';
import {Internals} from 'remotion';
import {getDurationOrCompute} from './get-duration-or-compute';

export type MediaMetadata = {
	duration: number;
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

export const getFrameRateFromMetrics = (
	metrics: Pick<
		FrameRateMetrics,
		'bestGuessFrameRate' | 'probedPacketCount'
	> | null,
) => {
	if (metrics === null || metrics.probedPacketCount < 2) {
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

const getMediabunnyMetadata = async (
	src: string,
): Promise<MediaMetadata | null> => {
	const lease = (() => {
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
						source: new UrlSource(src),
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
	})();

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
			videoTrack ? safeCall(() => videoTrack.computeFrameRateMetrics()) : null,
			videoTrack ? safeCall(() => videoTrack.hasHighDynamicRange()) : null,
			audioTrack ? safeCall(() => audioTrack.getCodec()) : null,
			audioTrack ? safeCall(() => audioTrack.getSampleRate()) : null,
		]);

		return {
			duration,
			format: format?.name ?? null,
			width,
			height,
			videoCodec,
			audioCodec,
			fps: getFrameRateFromMetrics(frameRateMetrics),
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

	const request = getMediabunnyMetadata(src)
		.catch(() => null)
		.then((metadata) => metadata ?? getFallbackVideoMetadata(src))
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

export const useMediaMetadata = (src: string | null): MediaMetadata | null => {
	const resolvedSrc = Internals.usePreload(src ?? '');
	const metadataSrc = src === null ? null : resolvedSrc;
	const [mediaMetadata, setMediaMetadata] = useState<MediaMetadata | null>(
		metadataSrc ? getCachedMediaMetadata(metadataSrc) : null,
	);

	useEffect(() => {
		const cached = metadataSrc ? getCachedMediaMetadata(metadataSrc) : null;
		setMediaMetadata(cached);

		if (!metadataSrc || cached) {
			return;
		}

		let cancelled = false;

		getMediaMetadata(metadataSrc)
			.then((metadata) => {
				if (cancelled) {
					return;
				}

				setMediaMetadata(metadata);
			})
			.catch(() => {
				if (cancelled) {
					return;
				}

				setMediaMetadata(null);
			});

		return () => {
			cancelled = true;
		};
	}, [metadataSrc]);

	return mediaMetadata;
};
