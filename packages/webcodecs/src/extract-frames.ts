import {parseMedia, type MediaParserLogLevel} from '@remotion/media-parser';
import {
	internalExtractFrames,
	type ExtractFramesTimestampsInSecondsFn,
} from './internal-extract-frames';

export type ExtractFramesProps = {
	src: string;
	timestampsInSeconds: number[] | ExtractFramesTimestampsInSecondsFn;
	onFrame: (frame: VideoFrame) => void;
	signal?: AbortSignal;
	acknowledgeRemotionLicense?: boolean;
	logLevel?: MediaParserLogLevel;
};

export type ExtractFrames = (options: ExtractFramesProps) => Promise<void>;

export const extractFrames: ExtractFrames = (options: ExtractFramesProps) => {
	return internalExtractFrames({
		...options,
		signal: options.signal ?? null,
		acknowledgeRemotionLicense: options.acknowledgeRemotionLicense ?? false,
		logLevel: options.logLevel ?? 'info',
		parseMediaImplementation: parseMedia,
	});
};
