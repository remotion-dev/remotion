import {type LogLevel} from 'remotion';
import {keyframeManager} from '../caches';
import {getSinkWeak} from '../get-sink-weak';

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
	const sink = await getSinkWeak(src, logLevel);

	const video = await sink.getVideo();

	if (video === 'no-video-track') {
		throw new Error(`No video track found for ${src}`);
	}

	if (video === 'cannot-decode') {
		throw new Error(`Cannot decode video track for ${src}`);
	}

	const timeInSeconds = loop
		? unloopedTimeinSeconds % (await sink.getDuration())
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
