import type {VideoSample} from 'mediabunny';
import type {LogLevel} from './log';
import {Log} from './log';

export type KeyframeBank = {
	startTimestampInSeconds: number;
	endTimestampInSeconds: number;
	getFrameFromTimestamp: (timestamp: number) => Promise<VideoSample | null>;
	prepareForDeletion: () => Promise<void>;
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
		length: number;
		size: number;
		timestamps: number[];
		allocationSizes: number[];
	};
};

export let iteratorsOpen = 0;
export let framesOpen = 0;

const roundTo6Digits = (timestamp: number) => {
	return Math.floor(timestamp * 1_000_000) / 1_000_000;
};

export const makeKeyframeBank = ({
	startTimestampInSeconds,
	endTimestampInSeconds,
	sampleIterator,
}: {
	startTimestampInSeconds: number;
	endTimestampInSeconds: number;
	sampleIterator: AsyncGenerator<VideoSample, void, unknown>;
}) => {
	const frames: Record<number, VideoSample> = {};
	const frameTimestamps: number[] = [];
	iteratorsOpen++;

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
			roundTo6Digits(lastFrame.timestamp + lastFrame.duration) >
			roundTo6Digits(timestamp)
		);
	};

	const addFrame = (frame: VideoSample) => {
		frames[frame.timestamp] = frame;
		frameTimestamps.push(frame.timestamp);
	};

	const ensureEnoughFramesForTimestamp = async (timestamp: number) => {
		while (!hasDecodedEnoughForTimestamp(timestamp)) {
			const sample = await sampleIterator.next();

			if (sample.value) {
				framesOpen++;
				addFrame(sample.value);
			}

			if (sample.done) {
				break;
			}
		}
	};

	const getFrameFromTimestamp = async (
		unroundedTimestampInSeconds: number,
	): Promise<VideoSample | null> => {
		if (unroundedTimestampInSeconds < startTimestampInSeconds) {
			return Promise.reject(
				new Error(
					`Timestamp is before start timestamp (requested: ${unroundedTimestampInSeconds}sec, start: ${startTimestampInSeconds})`,
				),
			);
		}

		if (unroundedTimestampInSeconds > endTimestampInSeconds) {
			return Promise.reject(
				new Error(
					`Timestamp is after end timestamp (requested: ${unroundedTimestampInSeconds}sec, end: ${endTimestampInSeconds})`,
				),
			);
		}

		// clip to first 6 digits
		// Because 1.666666 (6 digits) should also match 1.6666666666666 (unrounded)
		// 6 digits because webcodecs timescale is 1 million
		const timestampInSeconds = unroundedTimestampInSeconds;

		await ensureEnoughFramesForTimestamp(timestampInSeconds);

		for (let i = frameTimestamps.length - 1; i >= 0; i--) {
			const sample = frames[frameTimestamps[i]];
			if (!sample) {
				return null;
			}

			if (roundTo6Digits(sample.timestamp) <= timestampInSeconds) {
				return sample;
			}
		}

		throw new Error('No frame found for timestamp ' + timestampInSeconds);
	};

	const hasTimestampInSecond = async (timestamp: number) => {
		return (await getFrameFromTimestamp(timestamp)) !== null;
	};

	const prepareForDeletion = async () => {
		// Cleanup frames that have been extracted that might not have been retrieved yet
		const {value, done} = await sampleIterator.return();
		if (value) {
			value.close();
		}

		Log.verbose(
			'verbose',
			`Closed sample iterator ${Boolean(value)}, was done?${done}`,
		);

		for (const frameTimestamp of frameTimestamps) {
			if (!frames[frameTimestamp]) {
				continue;
			}

			frames[frameTimestamp].close();
			delete frames[frameTimestamp];
			framesOpen--;
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
		for (const frameTimestamp of frameTimestamps) {
			if (frameTimestamp < timestampInSeconds) {
				if (!frames[frameTimestamp]) {
					continue;
				}

				frames[frameTimestamp].close();
				delete frames[frameTimestamp];
				framesOpen--;
				Log.verbose(logLevel, `Deleted frame ${frameTimestamp} for src ${src}`);
			}
		}
	};

	const getOpenFrameCount = () => {
		const f = frameTimestamps
			.map((timestamp) => {
				const frame = frames[timestamp];
				return frame;
			})
			.filter(Boolean);
		const {length} = f;
		const timestamps: number[] = [];
		const allocationSizes: number[] = [];
		const size = f.reduce((acc, frame) => {
			const allocationSize = frame.allocationSize();
			if (allocationSize === 0) {
				Log.verbose(
					'verbose',
					`Frame ${frame.timestamp} has allocation size! ${allocationSize}`,
				);
			}

			timestamps.push(frame.timestamp);
			allocationSizes.push(allocationSize);
			return acc + allocationSize;
		}, 0);
		return {length, size, timestamps, allocationSizes};
	};

	const keyframeBank: KeyframeBank = {
		startTimestampInSeconds,
		endTimestampInSeconds,
		getFrameFromTimestamp,
		prepareForDeletion,
		hasTimestampInSecond,
		addFrame,
		deleteFramesBeforeTimestamp,
		getOpenFrameCount,
	};

	return keyframeBank;
};
