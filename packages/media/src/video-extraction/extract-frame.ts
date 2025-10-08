import type {VideoSample} from 'mediabunny';
import {Internals, type LogLevel} from 'remotion';
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

const getTimeInSeconds = ({
	loop,
	mediaDurationInSeconds,
	unloopedTimeinSeconds,
	src,
	endAt,
	startFrom,
	playbackRate,
	fps,
}: {
	loop: boolean;
	mediaDurationInSeconds: number | null;
	unloopedTimeinSeconds: number;
	src: string;
	endAt: number | undefined;
	startFrom: number | undefined;
	playbackRate: number;
	fps: number;
}) => {
	if (!loop) {
		return unloopedTimeinSeconds;
	}

	if (mediaDurationInSeconds === null) {
		throw new Error(
			`Could not determine duration of ${src}, but "loop" was set.`,
		);
	}

	const loopDuration =
		Internals.calculateLoopDuration({
			endAt,
			mediaDurationInFrames: mediaDurationInSeconds * fps,
			playbackRate,
			startFrom,
		}) / fps;

	const timeInSeconds = unloopedTimeinSeconds % loopDuration;
	return timeInSeconds + (startFrom ?? 0);
};

export const extractFrame = async ({
	src,
	timeInSeconds: unloopedTimeinSeconds,
	logLevel,
	loop,
	endAt,
	startFrom,
	playbackRate,
	fps,
}: {
	src: string;
	timeInSeconds: number;
	logLevel: LogLevel;
	loop: boolean;
	endAt: number | undefined;
	startFrom: number | undefined;
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

	const mediaDurationInSeconds = await sink.getDuration();

	if (loop && mediaDurationInSeconds === null) {
		throw new Error(
			`Could not determine duration of ${src}, but "loop" was set.`,
		);
	}

	const timeInSeconds = getTimeInSeconds({
		loop,
		mediaDurationInSeconds,
		unloopedTimeinSeconds,
		src,
		endAt,
		playbackRate,
		startFrom,
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
