import type {VideoSample} from 'mediabunny';
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
}): Promise<
	VideoSample | 'cannot-decode' | 'unknown-container-format' | null
> => {
	const sink = await getSinkWeak(src, logLevel);

	const video = await sink.getVideo();

	if (video === 'no-video-track') {
		throw new Error(`No video track found for ${src}`);
	}

	if (video === 'cannot-decode') {
		return 'cannot-decode';
	}

	if (video === 'unknown-container-format') {
		return 'unknown-container-format';
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

	if (!keyframeBank) {
		return null;
	}

	const frame = await keyframeBank.getFrameFromTimestamp(timeInSeconds);

	return frame;
};
