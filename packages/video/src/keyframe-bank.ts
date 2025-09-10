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

// Round to only 4 digits, because WebM has a timescale of 1_000, e.g. framer.webm
const roundTo4Digits = (timestamp: number) => {
	return Math.round(timestamp * 1_000) / 1_000;
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
			roundTo4Digits(lastFrame.timestamp + lastFrame.duration) >
			roundTo4Digits(timestamp)
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
		timestampInSeconds: number,
	): Promise<VideoSample | null> => {
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
				roundTo4Digits(sample.timestamp) <= roundTo4Digits(timestampInSeconds)
			) {
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
		const {value} = await sampleIterator.return();
		if (value) {
			value.close();
		}

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
