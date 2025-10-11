import type {VideoSample} from 'mediabunny';
import {Internals, type LogLevel} from 'remotion';
import {renderTimestampRange} from '../render-timestamp-range';

export type KeyframeBank = {
	startTimestampInSeconds: number;
	endTimestampInSeconds: number;
	getFrameFromTimestamp: (timestamp: number) => Promise<VideoSample | null>;
	prepareForDeletion: (logLevel: LogLevel) => void;
	deleteFramesBeforeTimestamp: ({
		logLevel,
		src,
		timestampInSeconds,
	}: {
		timestampInSeconds: number;
		logLevel: LogLevel;
		src: string;
	}) => void;
	hasTimestampInSecond: (timestamp: number) => Promise<boolean>;
	addFrame: (frame: VideoSample) => void;
	getOpenFrameCount: () => {
		size: number;
		timestamps: number[];
	};
	getLastUsed: () => number;
};

// Round to only 4 digits, because WebM has a timescale of 1_000, e.g. framer.webm
const roundTo4Digits = (timestamp: number) => {
	return Math.round(timestamp * 1_000) / 1_000;
};

export const makeKeyframeBank = ({
	startTimestampInSeconds,
	endTimestampInSeconds,
	sampleIterator,
	logLevel: parentLogLevel,
}: {
	startTimestampInSeconds: number;
	endTimestampInSeconds: number;
	sampleIterator: AsyncGenerator<VideoSample, void, unknown>;
	logLevel: LogLevel;
}) => {
	Internals.Log.verbose(
		{logLevel: parentLogLevel, tag: '@remotion/media'},
		`Creating keyframe bank from ${startTimestampInSeconds}sec to ${endTimestampInSeconds}sec`,
	);
	const frames: Record<number, VideoSample> = {};
	const frameTimestamps: number[] = [];

	let lastUsed = Date.now();

	let allocationSize = 0;

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

	const ensureEnoughFramesForTimestamp = async (timestamp: number) => {
		while (!hasDecodedEnoughForTimestamp(timestamp)) {
			const sample = await sampleIterator.next();

			if (sample.value) {
				addFrame(sample.value);
			}

			if (sample.done) {
				break;
			}
		}

		lastUsed = Date.now();
	};

	const getFrameFromTimestamp = async (
		timestampInSeconds: number,
	): Promise<VideoSample | null> => {
		lastUsed = Date.now();

		if (timestampInSeconds < startTimestampInSeconds) {
			return Promise.reject(
				new Error(
					`Timestamp is before start timestamp (requested: ${timestampInSeconds}sec, start: ${startTimestampInSeconds})`,
				),
			);
		}

		if (timestampInSeconds > endTimestampInSeconds) {
			return Promise.reject(
				new Error(
					`Timestamp is after end timestamp (requested: ${timestampInSeconds}sec, end: ${endTimestampInSeconds})`,
				),
			);
		}

		await ensureEnoughFramesForTimestamp(timestampInSeconds);

		for (let i = frameTimestamps.length - 1; i >= 0; i--) {
			const sample = frames[frameTimestamps[i]];
			if (!sample) {
				return null;
			}

			if (
				roundTo4Digits(sample.timestamp) <=
					roundTo4Digits(timestampInSeconds) ||
				// Match 0.3333333333 to 0.33355555
				// this does not satisfy the previous condition, since one rounds up and one rounds down
				Math.abs(sample.timestamp - timestampInSeconds) <= 0.001
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

		for (const frameTimestamp of frameTimestamps) {
			if (!frames[frameTimestamp]) {
				continue;
			}

			allocationSize -= frames[frameTimestamp].allocationSize();
			frames[frameTimestamp].close();
			delete frames[frameTimestamp];
		}

		frameTimestamps.length = 0;
	};

	const deleteFramesBeforeTimestamp = ({
		logLevel,
		src,
		timestampInSeconds,
	}: {
		timestampInSeconds: number;
		logLevel: LogLevel;
		src: string;
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
		prepareForDeletion: (logLevel: LogLevel) => {
			queue = queue.then(() => prepareForDeletion(logLevel));
			return queue as Promise<void>;
		},
		hasTimestampInSecond,
		addFrame,
		deleteFramesBeforeTimestamp,
		getOpenFrameCount,
		getLastUsed,
	};

	return keyframeBank;
};
