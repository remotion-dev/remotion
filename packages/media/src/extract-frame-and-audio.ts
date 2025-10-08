import type {LogLevel} from 'remotion';
import {extractAudio} from './audio-extraction/extract-audio';
import {extractFrame} from './video-extraction/extract-frame';
import type {ExtractFrameViaBroadcastChannelResult} from './video-extraction/extract-frame-via-broadcast-channel';

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
	endAt,
	startFrom,
	fps,
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
	endAt: number | undefined;
	startFrom: number | undefined;
	fps: number;
}): Promise<ExtractFrameViaBroadcastChannelResult> => {
	try {
		const [frame, audio] = await Promise.all([
			includeVideo
				? extractFrame({
						src,
						timeInSeconds,
						logLevel,
						loop,
						endAt,
						playbackRate,
						startFrom,
						fps,
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

		if (audio === 'unknown-container-format') {
			if (frame !== null) {
				frame?.frame?.close();
			}

			return {type: 'unknown-container-format'};
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

		return {
			type: 'success',
			frame: frame?.frame?.toVideoFrame() ?? null,
			audio: audio?.data ?? null,
			durationInSeconds: audio?.durationInSeconds ?? null,
		};
	} catch (err) {
		const error = err as Error;
		if (
			// Chrome
			error.message.includes('Failed to fetch') ||
			// Safari
			error.message.includes('Load failed') ||
			// Firefox
			error.message.includes('NetworkError when attempting to fetch resource')
		) {
			return {type: 'network-error'};
		}

		throw err;
	}
};
