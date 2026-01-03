import type {VideoSample} from 'mediabunny';
import {Internals, type LogLevel} from 'remotion';
import {SAFE_BACK_WINDOW_IN_SECONDS} from '../caches';
import {roundTo4Digits} from '../helpers/round-to-4-digits';
import {renderTimestampRange} from '../render-timestamp-range';
import {getAllocationSize} from './get-allocation-size';

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

				allocationSize -= getAllocationSize(frames[frameTimestamp]);

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
		if (frames[frame.timestamp]) {
			allocationSize -= getAllocationSize(frames[frame.timestamp]);
			frameTimestamps.splice(frameTimestamps.indexOf(frame.timestamp), 1);
			frames[frame.timestamp].close();
			delete frames[frame.timestamp];
		}

		frames[frame.timestamp] = frame;
		frameTimestamps.push(frame.timestamp);
		allocationSize += getAllocationSize(frame);

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

		// If the requested timestamp is before the start of this bank, clamp it to the start.
		// This matches Chrome's behavior: render the first available frame rather than showing black.
		// Videos don't always start at timestamp 0 due to encoding artifacts, container format quirks,
		// and keyframe positioning. Users have no control over this, so we clamp to the first frame.
		// Test case: https://github.com/remotion-dev/remotion/issues/5915
		let adjustedTimestamp = timestampInSeconds;

		if (
			roundTo4Digits(timestampInSeconds) <
			roundTo4Digits(startTimestampInSeconds)
		) {
			adjustedTimestamp = startTimestampInSeconds;
		}

		// If we request a timestamp after the end of the video, return the last frame
		// same behavior as <video>
		if (
			roundTo4Digits(adjustedTimestamp) > roundTo4Digits(endTimestampInSeconds)
		) {
			adjustedTimestamp = endTimestampInSeconds;
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

			allocationSize -= getAllocationSize(frames[frameTimestamp]);
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
