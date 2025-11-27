import type {LogLevel} from 'remotion';
import {extractAudio} from './audio-extraction/extract-audio';
import {isNetworkError} from './is-network-error';
import {extractFrame} from './video-extraction/extract-frame';
import type {ExtractFrameViaBroadcastChannelResult} from './video-extraction/extract-frame-via-broadcast-channel';
import {rotateFrame} from './video-extraction/rotate-frame';

export const extractFrameAndAudio = async ({
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
	crossOrigin,
}: {
	src: string;
	timeInSeconds: number;
	logLevel: LogLevel;
	durationInSeconds: number;
	playbackRate: number;
	includeAudio: boolean;
	includeVideo: boolean;
	loop: boolean;
	audioStreamIndex: number;
	trimAfter: number | undefined;
	trimBefore: number | undefined;
	fps: number;
	maxCacheSize: number;
	crossOrigin?: '' | 'anonymous' | 'use-credentials';
}): Promise<ExtractFrameViaBroadcastChannelResult> => {
	try {
		const [frame, audio] = await Promise.all([
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
						crossOrigin,
					})
				: null,
			includeAudio
				? extractAudio({
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
						crossOrigin,
					})
				: null,
		]);

		if (frame?.type === 'cannot-decode') {
			return {
				type: 'cannot-decode',
				durationInSeconds: frame.durationInSeconds,
			};
		}

		if (frame?.type === 'unknown-container-format') {
			return {type: 'unknown-container-format'};
		}

		if (frame?.type === 'cannot-decode-alpha') {
			return {
				type: 'cannot-decode-alpha',
				durationInSeconds: frame.durationInSeconds,
			};
		}

		if (frame?.type === 'network-error') {
			return {type: 'network-error'};
		}

		if (audio === 'unknown-container-format') {
			if (frame !== null) {
				frame?.frame?.close();
			}

			return {type: 'unknown-container-format'};
		}

		if (audio === 'network-error') {
			if (frame !== null) {
				frame?.frame?.close();
			}

			return {type: 'network-error'};
		}

		if (audio === 'cannot-decode') {
			if (frame?.type === 'success' && frame.frame !== null) {
				frame?.frame.close();
			}

			return {
				type: 'cannot-decode',
				durationInSeconds:
					frame?.type === 'success' ? frame.durationInSeconds : null,
			};
		}

		if (!frame?.frame) {
			return {
				type: 'success',
				frame: null,
				audio: audio?.data ?? null,
				durationInSeconds: audio?.durationInSeconds ?? null,
			};
		}

		return {
			type: 'success',
			frame: await rotateFrame({
				frame: frame.frame.toVideoFrame(),
				rotation: frame.frame.rotation,
			}),
			audio: audio?.data ?? null,
			durationInSeconds: audio?.durationInSeconds ?? null,
		};
	} catch (err) {
		const error = err as Error;
		if (isNetworkError(error)) {
			return {type: 'network-error'};
		}

		throw err;
	}
};
