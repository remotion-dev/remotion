import type {VideoSample} from 'mediabunny';
import {Log, type LogLevel} from 'remotion';

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
}: {
	startTimestampInSeconds: number;
	endTimestampInSeconds: number;
	sampleIterator: AsyncGenerator<VideoSample, void, unknown>;
}) => {
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
			roundTo4Digits(timestamp)
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
				roundTo4Digits(sample.timestamp) <= roundTo4Digits(timestampInSeconds)
			) {
				return sample;
			}
		}

		return null;
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
		for (const frameTimestamp of frameTimestamps) {
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

				Log.verbose(
					logLevel,
					`[Video] Deleted frame ${frameTimestamp} for src ${src}`,
				);
			}
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

	const keyframeBank: KeyframeBank = {
		startTimestampInSeconds,
		endTimestampInSeconds,
		getFrameFromTimestamp,
		prepareForDeletion,
		hasTimestampInSecond,
		addFrame,
		deleteFramesBeforeTimestamp,
		getOpenFrameCount,
		getLastUsed,
	};

	return keyframeBank;
};
