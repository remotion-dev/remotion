import {getVideoSink, type GetSink} from './get-frames-since-keyframe';
import {makeKeyframeManager} from './keyframe-manager';
import type {LogLevel} from './log';

const keyframeManager = makeKeyframeManager();
const sinkPromise: Record<string, Promise<GetSink>> = {};

export const extractFrame = async ({
	src,
	timestamp,
	logLevel,
}: {
	src: string;
	timestamp: number;
	logLevel: LogLevel;
}) => {
	if (!sinkPromise[src]) {
		sinkPromise[src] = getVideoSink(src);
	}

	const {packetSink, videoSampleSink} = await sinkPromise[src];

	const keyframeBank = await keyframeManager.requestKeyframeBank({
		packetSink,
		videoSampleSink,
		timestamp,
		src,
		logLevel,
	});

	const frame = await keyframeBank.getFrameFromTimestamp(timestamp);

	return frame;
};
