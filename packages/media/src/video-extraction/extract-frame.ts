import {Internals, type LogLevel} from 'remotion';
import {keyframeManager} from '../caches';
import {getSink} from '../get-sink';
import {getTimeInSeconds} from '../get-time-in-seconds';

type ExtractFrameResult =
	| {
			type: 'success';
			frame: VideoFrame | null;
			rotation: number;
			durationInSeconds: number | null;
	  }
	| {type: 'cannot-decode'; durationInSeconds: number | null}
	| {type: 'cannot-decode-alpha'; durationInSeconds: number | null}
	| {type: 'unknown-container-format'}
	| {type: 'network-error'};

type ExtractFrameParams = {
	src: string;
	timeInSeconds: number;
	logLevel: LogLevel;
	loop: boolean;
	trimAfter: number | undefined;
	trimBefore: number | undefined;
	playbackRate: number;
	fps: number;
	maxCacheSize: number;
};

const extractFrameInternal = async ({
	src,
	timeInSeconds: unloopedTimeInSeconds,
	logLevel,
	loop,
	trimAfter,
	trimBefore,
	playbackRate,
	fps,
	maxCacheSize,
}: ExtractFrameParams): Promise<ExtractFrameResult> => {
	const sink = await getSink(src, logLevel);

	const [video, mediaDurationInSecondsRaw] = await Promise.all([
		sink.getVideo(),
		loop ? sink.getDuration() : Promise.resolve(null),
	]);

	const mediaDurationInSeconds: number | null = loop
		? mediaDurationInSecondsRaw
		: null;

	if (video === 'no-video-track') {
		throw new Error(`No video track found for ${src}`);
	}

	if (video === 'cannot-decode') {
		return {type: 'cannot-decode', durationInSeconds: mediaDurationInSeconds};
	}

	if (video === 'unknown-container-format') {
		return {type: 'unknown-container-format'};
	}

	if (video === 'network-error') {
		return {type: 'network-error'};
	}

	if (video === 'cannot-decode-alpha') {
		return {
			type: 'cannot-decode-alpha',
			durationInSeconds: mediaDurationInSeconds,
		};
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
		ifNoMediaDuration: 'fail',
	});

	if (timeInSeconds === null) {
		return {
			type: 'success',
			frame: null,
			rotation: 0,
			durationInSeconds: await sink.getDuration(),
		};
	}

	// Must catch https://github.com/Vanilagy/mediabunny/issues/235
	// https://discord.com/channels/@me/1127949286789881897/1455728482150518906
	// Should be able to remove once upgraded to Chrome 145
	try {
		const keyframeBank = await keyframeManager.requestKeyframeBank({
			videoSampleSink: video.sampleSink,
			timestamp: timeInSeconds,
			src,
			logLevel,
			maxCacheSize,
			fps,
		});

		if (!keyframeBank) {
			return {
				type: 'success',
				frame: null,
				rotation: 0,
				durationInSeconds: await sink.getDuration(),
			};
		}

		const frame = await keyframeBank.getFrameFromTimestamp(timeInSeconds, fps);
		const rotation = frame?.rotation ?? 0;

		return {
			type: 'success',
			frame: frame?.toVideoFrame() ?? null,
			rotation,
			durationInSeconds: await sink.getDuration(),
		};
	} catch (err) {
		Internals.Log.info(
			{logLevel, tag: '@remotion/media'},
			`Error decoding ${src} at time ${timeInSeconds}: ${err}`,
			err,
		);
		return {type: 'cannot-decode', durationInSeconds: mediaDurationInSeconds};
	}
};

type ExtractFrameReturnType = Awaited<ReturnType<typeof extractFrameInternal>>;

let queue = Promise.resolve<ExtractFrameReturnType | undefined>(undefined);

export const extractFrame = (
	params: ExtractFrameParams,
): Promise<ExtractFrameReturnType> => {
	queue = queue.then(() => extractFrameInternal(params));

	return queue as Promise<ExtractFrameReturnType>;
};
