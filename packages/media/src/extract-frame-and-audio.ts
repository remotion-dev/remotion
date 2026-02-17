import type {LogLevel} from 'remotion';
import {extractAudio} from './audio-extraction/extract-audio';
import {isNetworkError} from './is-type-of-error';
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
}): Promise<ExtractFrameViaBroadcastChannelResult> => {
	try {
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
					})
				: null,
		]);

		if (video?.type === 'cannot-decode') {
			return {
				type: 'cannot-decode',
				durationInSeconds: video.durationInSeconds,
			};
		}

		if (video?.type === 'unknown-container-format') {
			return {type: 'unknown-container-format'};
		}

		if (video?.type === 'cannot-decode-alpha') {
			return {
				type: 'cannot-decode-alpha',
				durationInSeconds: video.durationInSeconds,
			};
		}

		if (video?.type === 'network-error') {
			return {type: 'network-error'};
		}

		if (audio === 'unknown-container-format') {
			return {type: 'unknown-container-format'};
		}

		if (audio === 'network-error') {
			return {type: 'network-error'};
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
			return {type: 'network-error'};
		}

		throw err;
	}
};
