import type {LogLevel} from 'remotion';
import {extractAudio} from './audio-extraction/extract-audio';
import type {PcmS16AudioData} from './convert-audiodata/convert-audiodata';
import {extractFrame} from './video-extraction/extract-frame';

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
}): Promise<
	| {
			frame: VideoFrame | null;
			audio: PcmS16AudioData | null;
			durationInSeconds: number | null;
	  }
	| 'cannot-decode'
	| 'unknown-container-format'
	| 'network-error'
> => {
	try {
		const [frame, audio] = await Promise.all([
			includeVideo
				? extractFrame({
						src,
						timeInSeconds,
						logLevel,
						loop,
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

		if (frame === 'cannot-decode') {
			return 'cannot-decode';
		}

		if (frame === 'unknown-container-format') {
			return 'unknown-container-format';
		}

		if (audio === 'unknown-container-format') {
			return 'unknown-container-format';
		}

		if (audio === 'cannot-decode') {
			if (frame !== null) {
				frame?.close();
			}

			return 'cannot-decode';
		}

		return {
			frame: frame?.toVideoFrame() ?? null,
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
			return 'network-error';
		}

		throw err;
	}
};
