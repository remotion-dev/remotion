import type {VideoSample} from 'mediabunny';
import {Internals, type LogLevel} from 'remotion';
import {SAFE_BACK_WINDOW_IN_SECONDS} from '../caches';
import {roundTo4Digits} from '../helpers/round-to-4-digits';
import {renderTimestampRange} from '../render-timestamp-range';

export type KeyframeBank = {
	src: string;
	startTimestampInSeconds: number;
	endTimestampInSeconds: number;
	getFrameFromTimestamp: (timestamp: number) => Promise<VideoSample | null>;
	prepareForDeletion: (logLevel: LogLevel) => {framesDeleted: number};
	deleteFramesBeforeTimestamp: ({
		logLevel,
		timestampInSeconds,
	}: {
		timestampInSeconds: number;
		logLevel: LogLevel;
	}) => void;
	hasTimestampInSecond: (timestamp: number) => Promise<boolean>;
	addFrame: (frame: VideoSample) => void;
	getOpenFrameCount: () => {
		size: number;
		timestamps: number[];
	};
	getLastUsed: () => number;
};

export const makeKeyframeBank = ({
	startTimestampInSeconds,
	endTimestampInSeconds,
	sampleIterator,
	logLevel: parentLogLevel,
	src,
}: {
	startTimestampInSeconds: number;
	endTimestampInSeconds: number;
	sampleIterator: AsyncGenerator<VideoSample, void, unknown>;
	logLevel: LogLevel;
	src: string;
}) => {
	Internals.Log.verbose(
		{logLevel: parentLogLevel, tag: '@remotion/media'},
		`Creating keyframe bank from ${startTimestampInSeconds}sec to ${endTimestampInSeconds}sec`,
	);
	const frames: Record<number, VideoSample> = {};
	const frameTimestamps: number[] = [];

	let lastUsed = Date.now();

	let allocationSize = 0;

	const deleteFramesBeforeTimestamp = ({
		logLevel,
		timestampInSeconds,
	}: {
		timestampInSeconds: number;
		logLevel: LogLevel;
	}) => {
		const deletedTimestamps = [];
		for (const frameTimestamp of frameTimestamps.slice()) {
			const isLast =
				frameTimestamp === frameTimestamps[frameTimestamps.length - 1];
			// Don't delete the last frame, since it may be the last one in the video!
			if (isLast) {
				continue;
			}

			if (frameTimestamp < timestampInSeconds) {
				if (!frames[frameTimestamp]) {
					continue;
				}

				allocationSize -= frames[frameTimestamp].allocationSize();

				frameTimestamps.splice(frameTimestamps.indexOf(frameTimestamp), 1);
				frames[frameTimestamp].close();
				delete frames[frameTimestamp];
				deletedTimestamps.push(frameTimestamp);
			}
		}

		if (deletedTimestamps.length > 0) {
			Internals.Log.verbose(
				{logLevel, tag: '@remotion/media'},
				`Deleted ${deletedTimestamps.length} frame${deletedTimestamps.length === 1 ? '' : 's'} ${renderTimestampRange(deletedTimestamps)} for src ${src} because it is lower than ${timestampInSeconds}. Remaining: ${renderTimestampRange(frameTimestamps)}`,
			);
		}
	};

	const hasDecodedEnoughForTimestamp = (timestamp: number) => {
		const lastFrameTimestamp = frameTimestamps[frameTimestamps.length - 1];
		if (!lastFrameTimestamp) {
			return false;
		}

		const lastFrame = frames[lastFrameTimestamp];
		// Don't decode more, will probably have to re-decode everything
		if (!lastFrame) {
			return true;
		}

		return (
			roundTo4Digits(lastFrame.timestamp + lastFrame.duration) >
			roundTo4Digits(timestamp) + 0.001
		);
	};

	const addFrame = (frame: VideoSample) => {
		frames[frame.timestamp] = frame;
		frameTimestamps.push(frame.timestamp);
		allocationSize += frame.allocationSize();

		lastUsed = Date.now();
	};

	const ensureEnoughFramesForTimestamp = async (timestampInSeconds: number) => {
		while (!hasDecodedEnoughForTimestamp(timestampInSeconds)) {
			const sample = await sampleIterator.next();

			if (sample.value) {
				addFrame(sample.value);
			}

			if (sample.done) {
				break;
			}

			deleteFramesBeforeTimestamp({
				logLevel: parentLogLevel,
				timestampInSeconds: timestampInSeconds - SAFE_BACK_WINDOW_IN_SECONDS,
			});
		}

		lastUsed = Date.now();
	};

	const getFrameFromTimestamp = async (
		timestampInSeconds: number,
	): Promise<VideoSample | null> => {
		lastUsed = Date.now();

		// Videos may start slightly after timestamp 0 due to encoding, but if the requested timestamp is too far before the bank start, something is likely wrong.
		const maxClampToleranceInSeconds = 0.1;

		// If the requested timestamp is before the start of this bank, clamp it to the start if within tolerance. This handles videos that don't start at timestamp 0.

		// For example, requesting frame at 0sec when video starts at 0.04sec should return the frame at 0.04sec.
		let adjustedTimestamp = timestampInSeconds;

		if (timestampInSeconds < startTimestampInSeconds) {
			const differenceInSeconds = startTimestampInSeconds - timestampInSeconds;

			if (differenceInSeconds <= maxClampToleranceInSeconds) {
				adjustedTimestamp = startTimestampInSeconds;
			} else {
				return Promise.reject(
					new Error(
						`Timestamp is before start timestamp (requested: ${timestampInSeconds}sec, start: ${startTimestampInSeconds}sec, difference: ${differenceInSeconds.toFixed(3)}sec exceeds tolerance of ${maxClampToleranceInSeconds}sec)`,
					),
				);
			}
		}

		if (adjustedTimestamp > endTimestampInSeconds) {
			return Promise.reject(
				new Error(
					`Timestamp is after end timestamp (requested: ${timestampInSeconds}sec, end: ${endTimestampInSeconds}sec)`,
				),
			);
		}

		await ensureEnoughFramesForTimestamp(adjustedTimestamp);

		for (let i = frameTimestamps.length - 1; i >= 0; i--) {
			const sample = frames[frameTimestamps[i]];
			if (!sample) {
				return null;
			}

			if (
				roundTo4Digits(sample.timestamp) <= roundTo4Digits(adjustedTimestamp) ||
				// Match 0.3333333333 to 0.33355555
				// this does not satisfy the previous condition, since one rounds up and one rounds down
				Math.abs(sample.timestamp - adjustedTimestamp) <= 0.001
			) {
				return sample;
			}
		}

		return null;
	};

	const hasTimestampInSecond = async (timestamp: number) => {
		return (await getFrameFromTimestamp(timestamp)) !== null;
	};

	const prepareForDeletion = (logLevel: LogLevel) => {
		Internals.Log.verbose(
			{logLevel, tag: '@remotion/media'},
			`Preparing for deletion of keyframe bank from ${startTimestampInSeconds}sec to ${endTimestampInSeconds}sec`,
		);
		// Cleanup frames that have been extracted that might not have been retrieved yet
		sampleIterator.return().then((result) => {
			if (result.value) {
				result.value.close();
			}

			return null;
		});

		let framesDeleted = 0;

		for (const frameTimestamp of frameTimestamps) {
			if (!frames[frameTimestamp]) {
				continue;
			}

			allocationSize -= frames[frameTimestamp].allocationSize();
			frames[frameTimestamp].close();
			delete frames[frameTimestamp];
			framesDeleted++;
		}

		frameTimestamps.length = 0;
		return {framesDeleted};
	};

	const getOpenFrameCount = () => {
		return {
			size: allocationSize,
			timestamps: frameTimestamps,
		};
	};

	const getLastUsed = () => {
		return lastUsed;
	};

	let queue = Promise.resolve<unknown>(undefined);

	const keyframeBank: KeyframeBank = {
		startTimestampInSeconds,
		endTimestampInSeconds,
		getFrameFromTimestamp: (timestamp: number) => {
			queue = queue.then(() => getFrameFromTimestamp(timestamp));
			return queue as Promise<VideoSample | null>;
		},
		prepareForDeletion,
		hasTimestampInSecond,
		addFrame,
		deleteFramesBeforeTimestamp,
		src,
		getOpenFrameCount,
		getLastUsed,
	};

	return keyframeBank;
};
