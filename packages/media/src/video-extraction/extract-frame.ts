import {keyframeManager} from '../caches';
import type {LogLevel} from '../log';
import {getSinks, type GetSink} from './get-frames-since-keyframe';

export const sinkPromises: Record<string, Promise<GetSink>> = {};

export const extractFrame = async ({
	src,
	timeInSeconds: unloopedTimeinSeconds,
	logLevel,
	loop,
}: {
	src: string;
	timeInSeconds: number;
	logLevel: LogLevel;
	loop: boolean;
}) => {
	if (!sinkPromises[src]) {
		sinkPromises[src] = getSinks(src);
	}

	const {video, getDuration} = await sinkPromises[src];

	const timeInSeconds = loop
		? unloopedTimeinSeconds % (await getDuration())
		: unloopedTimeinSeconds;

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
