import type {LogLevel} from '../log';
import {getSinks, type GetSink} from './get-frames-since-keyframe';
import {makeKeyframeManager} from './keyframe-manager';

export const keyframeManager = makeKeyframeManager();
export const sinkPromises: Record<string, Promise<GetSink>> = {};

export const extractFrame = async ({
	src,
	timeInSeconds,
	logLevel,
}: {
	src: string;
	timeInSeconds: number;
	logLevel: LogLevel;
}) => {
	if (!sinkPromises[src]) {
		sinkPromises[src] = getSinks(src);
	}

	const {video} = await sinkPromises[src];

	const keyframeBank = await keyframeManager.requestKeyframeBank({
		packetSink: video.packetSink,
		videoSampleSink: video.sampleSink,
		timestamp: timeInSeconds,
		src,
		logLevel,
	});

	const frame = await keyframeBank.getFrameFromTimestamp(timeInSeconds);

	return frame;
};
