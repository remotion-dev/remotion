import type {LogLevel} from 'remotion';
import {extractAudio} from './audio-extraction/extract-audio';
import type {MediaCache} from './caches';
import {isNetworkError} from './is-type-of-error';
import type {MediaRequestInit} from './request-init';
import {extractFrame} from './video-extraction/extract-frame';
import type {ExtractFrameViaBroadcastChannelResult} from './video-extraction/extract-frame-via-broadcast-channel';
import {rotateFrame} from './video-extraction/rotate-frame';

export const extractFrameAndAudio = async ({
	sampleRate,
	src,
	timeInSeconds,
	logLevel,
	durationInSeconds,
	playbackRate,
	includeAudio,
	includeVideo,
	loop,
	audioStreamIndex,
	trimAfter,
	trimBefore,
	fps,
	maxCacheSize,
	credentials,
	requestInit,
	mediaCache,
}: {
	sampleRate: number;
	src: string;
	timeInSeconds: number;
	logLevel: LogLevel;
	durationInSeconds: number;
	playbackRate: number;
	includeAudio: boolean;
	includeVideo: boolean;
	loop: boolean;
	audioStreamIndex: number | null;
	trimAfter: number | undefined;
	trimBefore: number | undefined;
	fps: number;
	maxCacheSize: number;
	credentials: RequestCredentials | undefined;
	requestInit?: MediaRequestInit;
	mediaCache: MediaCache;
}): Promise<ExtractFrameViaBroadcastChannelResult> => {
	try {
		if (includeVideo || includeAudio) {
			const sink = await mediaCache.sinkManager.getSink(
				src,
				logLevel,
				credentials,
				requestInit,
			);
			// Handle format detection before extraction, including duration reads for loops.
			if (sink.formatDetectionError) {
				return {
					type: isNetworkError(sink.formatDetectionError)
						? 'network-error'
						: 'unknown-container-format',
					error: sink.formatDetectionError,
				};
			}
		}

		const [video, audio] = await Promise.all([
			includeVideo
				? extractFrame({
						src,
						timeInSeconds,
						logLevel,
						loop,
						trimAfter,
						playbackRate,
						trimBefore,
						fps,
						maxCacheSize,
						credentials,
						requestInit,
						mediaCache,
					})
				: null,
			includeAudio
				? extractAudio({
						sampleRate,
						src,
						timeInSeconds,
						durationInSeconds,
						logLevel,
						loop,
						playbackRate,
						audioStreamIndex,
						trimAfter,
						fps,
						trimBefore,
						maxCacheSize,
						credentials,
						requestInit,
						mediaCache,
					})
				: null,
		]);

		if (video?.type === 'cannot-decode') {
			return {
				type: 'cannot-decode',
				durationInSeconds: video.durationInSeconds,
			};
		}

		if (video?.type === 'cannot-decode-prores') {
			return {
				type: 'cannot-decode-prores',
				durationInSeconds: video.durationInSeconds,
			};
		}

		if (video?.type === 'unknown-container-format') {
			return {type: 'unknown-container-format', error: null};
		}

		if (video?.type === 'cannot-decode-alpha') {
			return {
				type: 'cannot-decode-alpha',
				durationInSeconds: video.durationInSeconds,
			};
		}

		if (video?.type === 'network-error') {
			return {type: 'network-error', error: null};
		}

		if (audio === 'unknown-container-format') {
			return {type: 'unknown-container-format', error: null};
		}

		if (audio === 'network-error') {
			return {type: 'network-error', error: null};
		}

		if (audio === 'cannot-decode') {
			return {
				type: 'cannot-decode',
				durationInSeconds:
					video?.type === 'success' ? video.durationInSeconds : null,
			};
		}

		return {
			type: 'success',
			frame: video?.frame
				? await rotateFrame({
						frame: video.frame,
						rotation: video.rotation,
					})
				: null,
			audio: audio?.data ?? null,
			durationInSeconds: audio?.durationInSeconds ?? null,
		};
	} catch (err) {
		const error = err as Error;
		if (isNetworkError(error)) {
			return {type: 'network-error', error};
		}

		throw err;
	}
};
