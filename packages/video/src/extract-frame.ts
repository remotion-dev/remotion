import type {GetSink} from './get-frames-since-keyframe';
import type {KeyframeManager} from './keyframe-manager';

export const extractFrame = async ({
	src,
	timestamp,
	sinkPromise,
	keyframeManager,
}: {
	src: string;
	timestamp: number;
	sinkPromise: Promise<GetSink>;
	keyframeManager: KeyframeManager;
}) => {
	const {packetSink, videoSampleSink} = await sinkPromise;

	const keyframeBank = await keyframeManager.requestKeyframeBank({
		packetSink,
		videoSampleSink,
		timestamp,
		src,
	});

	return keyframeBank.getFrameFromTimestamp(timestamp);
};
