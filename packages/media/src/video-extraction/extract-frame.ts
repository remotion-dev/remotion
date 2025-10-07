import type {VideoSample} from 'mediabunny';
import {type LogLevel} from 'remotion';
import {keyframeManager} from '../caches';
import {getSinkWeak} from '../get-sink-weak';

type ExtractFrameResult =
	| {
			type: 'success';
			frame: VideoSample | null;
			durationInSeconds: number | null;
	  }
	| {type: 'cannot-decode'; durationInSeconds: number | null}
	| {type: 'unknown-container-format'};

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
}): Promise<ExtractFrameResult> => {
	const sink = await getSinkWeak(src, logLevel);

	const video = await sink.getVideo();

	if (video === 'no-video-track') {
		throw new Error(`No video track found for ${src}`);
	}

	if (video === 'cannot-decode') {
		return {type: 'cannot-decode', durationInSeconds: await sink.getDuration()};
	}

	if (video === 'unknown-container-format') {
		return {type: 'unknown-container-format'};
	}

	const durationInSeconds = await sink.getDuration();

	if (loop && durationInSeconds === null) {
		throw new Error(
			`Could not determine duration of ${src}, but "loop" was set.`,
		);
	}

	const timeInSeconds = loop
		? unloopedTimeinSeconds % durationInSeconds!
		: unloopedTimeinSeconds;

	const keyframeBank = await keyframeManager.requestKeyframeBank({
		packetSink: video.packetSink,
		videoSampleSink: video.sampleSink,
		timestamp: timeInSeconds,
		src,
		logLevel,
	});

	if (!keyframeBank) {
		return {
			type: 'success',
			frame: null,
			durationInSeconds: await sink.getDuration(),
		};
	}

	const frame = await keyframeBank.getFrameFromTimestamp(timeInSeconds);

	return {type: 'success', frame, durationInSeconds: await sink.getDuration()};
};
