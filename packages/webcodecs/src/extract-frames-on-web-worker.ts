import {type MediaParserLogLevel} from '@remotion/media-parser';
import {parseMediaOnWebWorker} from '@remotion/media-parser/worker';
import {
	internalExtractFrames,
	type ExtractFramesTimestampsInSecondsFn,
} from './internal-extract-frames';

export type ExtractFramesOnWebWorkerProps = {
	src: string;
	timestampsInSeconds: number[] | ExtractFramesTimestampsInSecondsFn;
	onFrame: (frame: VideoFrame) => void;
	signal?: AbortSignal;
	acknowledgeRemotionLicense?: boolean;
	logLevel?: MediaParserLogLevel;
};

export type ExtractFramesOnWebWorker = (
	options: ExtractFramesOnWebWorkerProps,
) => Promise<void>;

export const extractFramesOnWebWorker: ExtractFramesOnWebWorker = (
	options: ExtractFramesOnWebWorkerProps,
) => {
	return internalExtractFrames({
		...options,
		signal: options.signal ?? null,
		acknowledgeRemotionLicense: options.acknowledgeRemotionLicense ?? false,
		logLevel: options.logLevel ?? 'info',
		parseMediaImplementation: parseMediaOnWebWorker,
	});
};
