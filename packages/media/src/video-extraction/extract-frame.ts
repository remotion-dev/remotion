import type {VideoSample} from 'mediabunny';
import {type LogLevel} from 'remotion';
import {keyframeManager} from '../caches';
import {getSinkWeak} from '../get-sink-weak';
import {getTimeInSeconds} from '../get-time-in-seconds';

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
	timeInSeconds: unloopedTimeInSeconds,
	logLevel,
	loop,
	trimAfter,
	trimBefore,
	playbackRate,
	fps,
}: {
	src: string;
	timeInSeconds: number;
	logLevel: LogLevel;
	loop: boolean;
	trimAfter: number | undefined;
	trimBefore: number | undefined;
	playbackRate: number;
	fps: number;
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

	let mediaDurationInSeconds: number | null = null;

	if (loop) {
		mediaDurationInSeconds = await sink.getDuration();
	}

	const timeInSeconds = getTimeInSeconds({
		loop,
		mediaDurationInSeconds,
		unloopedTimeInSeconds,
		src,
		trimAfter,
		playbackRate,
		trimBefore,
		fps,
	});

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
