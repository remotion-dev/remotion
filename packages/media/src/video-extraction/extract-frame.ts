import {Internals, type LogLevel} from 'remotion';
import {keyframeManager} from '../caches';
import {getSink} from '../get-sink';
import {getTimeInSeconds} from '../get-time-in-seconds';
import type {MediaExtractionTrace} from '../media-extraction-trace';
import {traceMediaOperation} from '../media-extraction-trace';
import type {MediaRequestInit} from '../request-init';

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
	credentials: RequestCredentials | undefined;
	requestInit?: MediaRequestInit;
	trace?: MediaExtractionTrace;
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
	credentials,
	requestInit,
	trace,
}: ExtractFrameParams): Promise<ExtractFrameResult> => {
	const sink = await traceMediaOperation({
		trace,
		label: 'video:getSink',
		operation: () => getSink(src, logLevel, credentials, requestInit),
	});

	const [video, mediaDurationInSecondsRaw] = await Promise.all([
		traceMediaOperation({
			trace,
			label: 'video:sink.getVideo',
			operation: () => sink.getVideo(),
		}),
		loop
			? traceMediaOperation({
					trace,
					label: 'video:sink.getDuration',
					operation: () => sink.getDuration(),
				})
			: Promise.resolve(null),
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
			durationInSeconds: await traceMediaOperation({
				trace,
				label: 'video:sink.getDuration',
				operation: () => sink.getDuration(),
			}),
		};
	}

	// Must catch https://github.com/Vanilagy/mediabunny/issues/235
	// https://discord.com/channels/@me/1127949286789881897/1455728482150518906
	// Should be able to remove once upgraded to Chrome 145
	try {
		const keyframeBank = await traceMediaOperation({
			trace,
			label: 'video:keyframeManager.requestKeyframeBank',
			operation: () =>
				keyframeManager.requestKeyframeBank({
					videoSampleSink: video.sampleSink,
					timestamp: timeInSeconds,
					src,
					logLevel,
					maxCacheSize,
					fps,
					trace,
				}),
		});

		if (!keyframeBank) {
			return {
				type: 'success',
				frame: null,
				rotation: 0,
				durationInSeconds: await traceMediaOperation({
					trace,
					label: 'video:sink.getDuration',
					operation: () => sink.getDuration(),
				}),
			};
		}

		const frame = await traceMediaOperation({
			trace,
			label: 'video:keyframeBank.getFrameFromTimestamp',
			operation: () =>
				keyframeBank.getFrameFromTimestamp(timeInSeconds, fps, trace),
		});
		const rotation = frame?.rotation ?? 0;

		return {
			type: 'success',
			frame:
				(await traceMediaOperation({
					trace,
					label: 'video:sample.toVideoFrame',
					operation: () => frame?.toVideoFrame() ?? null,
				})) ?? null,
			rotation,
			durationInSeconds: await traceMediaOperation({
				trace,
				label: 'video:sink.getDuration',
				operation: () => sink.getDuration(),
			}),
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

export const resetExtractFrameQueue = () => {
	queue = Promise.resolve<ExtractFrameReturnType | undefined>(undefined);
};

export const extractFrame = (
	params: ExtractFrameParams,
): Promise<ExtractFrameReturnType> => {
	queue = queue.then(() => extractFrameInternal(params));

	return queue as Promise<ExtractFrameReturnType>;
};
