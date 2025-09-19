import type {LogLevel} from 'remotion';
import type {PcmS16AudioData} from './convert-audiodata/convert-audiodata';
import {extractAudio} from './extract-audio';
import {extractFrame} from './extract-frame';

export const extractFrameAndAudio = async ({
	src,
	timeInSeconds,
	logLevel,
	durationInSeconds,
	includeAudio,
	includeVideo,
	volume,
}: {
	src: string;
	timeInSeconds: number;
	logLevel: LogLevel;
	durationInSeconds: number;
	includeAudio: boolean;
	includeVideo: boolean;
	volume: number;
}): Promise<{
	frame: VideoFrame | null;
	audio: PcmS16AudioData | null;
}> => {
	const [frame, audio] = await Promise.all([
		includeVideo
			? extractFrame({
					src,
					timeInSeconds,
					logLevel,
				})
			: null,
		includeAudio
			? extractAudio({
					src,
					timeInSeconds,
					durationInSeconds,
					volume,
				})
			: null,
	]);

	return {
		frame: frame?.toVideoFrame() ?? null,
		audio,
	};
};
