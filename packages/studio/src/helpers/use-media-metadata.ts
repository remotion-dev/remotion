import {getVideoMetadata} from '@remotion/media-utils';
import type {InputAudioTrack, InputVideoTrack} from 'mediabunny';
import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import {useEffect, useState} from 'react';
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
	let input: Input;

	try {
		input = new Input({
			formats: ALL_FORMATS,
			source: new UrlSource(src),
		});
	} catch {
		return null;
	}

	try {
		const [duration, format, videoTrack, audioTrack] = await Promise.all([
			safeCall(() => getDurationOrCompute(input)),
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
			packetStats,
			isHdr,
			audioCodec,
			sampleRate,
		] = await Promise.all([
			videoTrack ? safeCall(() => videoTrack.getDisplayWidth()) : null,
			videoTrack ? safeCall(() => videoTrack.getDisplayHeight()) : null,
			videoTrack ? safeCall(() => videoTrack.getCodec()) : null,
			videoTrack ? safeCall(() => videoTrack.computePacketStats(50)) : null,
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
			fps: packetStats?.averagePacketRate ?? null,
			isHdr,
			sampleRate,
			hasVideoTrack: Boolean(videoTrack),
			hasAudioTrack: Boolean(audioTrack),
		};
	} finally {
		try {
			input.dispose();
		} catch {
			// ignore
		}
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
	const [mediaMetadata, setMediaMetadata] = useState<MediaMetadata | null>(
		src ? (cache.get(src) ?? null) : null,
	);

	useEffect(() => {
		const cached = src ? (cache.get(src) ?? null) : null;
		setMediaMetadata(cached);

		if (!src || cached) {
			return;
		}

		let cancelled = false;

		getMediaMetadata(src)
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
	}, [src]);

	return mediaMetadata;
};
