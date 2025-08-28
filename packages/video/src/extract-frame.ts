import type {GetSink} from './get-frames-since-keyframe';
import type {KeyframeManager} from './keyframe-manager';
import type {LogLevel} from './log';

export const extractFrame = async ({
	src,
	timestamp,
	sinkPromise,
	keyframeManager,
	logLevel,
}: {
	src: string;
	timestamp: number;
	sinkPromise: Promise<GetSink>;
	keyframeManager: KeyframeManager;
	logLevel: LogLevel;
}) => {
	const {packetSink, videoSampleSink} = await sinkPromise;

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
