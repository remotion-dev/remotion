import type {VideoSample, VideoSampleSink} from 'mediabunny';
import {Internals, type LogLevel} from 'remotion';
import {SAFE_WINDOW_OF_MONOTONICITY} from '../caches';
import {roundTo4Digits} from '../helpers/round-to-4-digits';
import {renderTimestampRange} from '../render-timestamp-range';
import {getAllocationSize} from './get-allocation-size';

export type KeyframeBank = {
	src: string;
	getFrameFromTimestamp: (timestamp: number) => Promise<VideoSample | null>;
	prepareForDeletion: (
		logLevel: LogLevel,
		reason: string,
	) => {framesDeleted: number};
	deleteFramesBeforeTimestamp: ({
		logLevel,
		timestampInSeconds,
	}: {
		timestampInSeconds: number;
		logLevel: LogLevel;
	}) => void;
	hasTimestampInSecond: (timestamp: number) => Promise<boolean>;
	addFrame: (frame: VideoSample, logLevel: LogLevel) => void;
	getOpenFrameCount: () => {
		size: number;
		timestamps: number[];
	};
	getLastUsed: () => number;
	canSatisfyTimestamp: (timestamp: number) => boolean;
	getRangeOfTimestamps: () => {
		firstTimestamp: number;
		lastTimestamp: number;
	} | null;
};

const BIGGEST_ALLOWED_JUMP_FORWARD_SECONDS = 3;

export const makeKeyframeBank = async ({
	logLevel: parentLogLevel,
	src,
	videoSampleSink,
	requestedTimestamp,
}: {
	logLevel: LogLevel;
	src: string;
	videoSampleSink: VideoSampleSink;
	requestedTimestamp: number;
}) => {
	const sampleIterator = videoSampleSink.samples(
		roundTo4Digits(requestedTimestamp),
	);

	const frames: Record<number, VideoSample> = {};
	const frameTimestamps: number[] = [];

	let hasReachedEndOfVideo = false;

	let lastUsed = Date.now();
	let allocationSize = 0;

	const deleteFrameAtTimestamp = (timestamp: number) => {
		allocationSize -= getAllocationSize(frames[timestamp]);
		frameTimestamps.splice(frameTimestamps.indexOf(timestamp), 1);
		frames[timestamp].close();
		delete frames[timestamp];
	};

	const deleteFramesBeforeTimestamp = ({
		logLevel,
		timestampInSeconds,
	}: {
		timestampInSeconds: number;
		logLevel: LogLevel;
	}) => {
		const deletedTimestamps = [];
		for (const frameTimestamp of frameTimestamps.slice()) {
			// Don't delete the last frame, since it may be the last one in the video!
			if (hasReachedEndOfVideo) {
				const isLast =
					frameTimestamp === frameTimestamps[frameTimestamps.length - 1];
				if (isLast) {
					continue;
				}
			}

			if (frameTimestamp < timestampInSeconds) {
				if (!frames[frameTimestamp]) {
					continue;
				}

				deleteFrameAtTimestamp(frameTimestamp);
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
		// Last frame is unavailable, we return true to not continue the loop,
		// since we probably have to re-decode everything
		if (!lastFrame) {
			return true;
		}

		return (
			roundTo4Digits(lastFrame.timestamp + lastFrame.duration) >
			roundTo4Digits(timestamp) + SAFE_WINDOW_OF_MONOTONICITY
		);
	};

	const addFrame = (frame: VideoSample, logLevel: LogLevel) => {
		if (frames[frame.timestamp]) {
			deleteFrameAtTimestamp(frame.timestamp);
		}

		frames[frame.timestamp] = frame;
		frameTimestamps.push(frame.timestamp);
		allocationSize += getAllocationSize(frame);

		lastUsed = Date.now();
		Internals.Log.trace(
			{logLevel, tag: '@remotion/media'},
			`Added frame at ${frame.timestamp}sec to bank`,
		);
	};

	const ensureEnoughFramesForTimestamp = async (
		timestampInSeconds: number,
		logLevel: LogLevel,
	) => {
		while (!hasDecodedEnoughForTimestamp(timestampInSeconds)) {
			const sample = await sampleIterator.next();

			if (sample.value) {
				addFrame(sample.value, logLevel);
			}

			if (sample.done) {
				hasReachedEndOfVideo = true;
				break;
			}

			deleteFramesBeforeTimestamp({
				logLevel: parentLogLevel,
				timestampInSeconds: timestampInSeconds - SAFE_WINDOW_OF_MONOTONICITY,
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

		// If we request a timestamp after the end of the video, return the last frame
		// same behavior as <video>
		if (
			hasReachedEndOfVideo &&
			roundTo4Digits(adjustedTimestamp) >
				roundTo4Digits(frameTimestamps[frameTimestamps.length - 1])
		) {
			adjustedTimestamp = frameTimestamps[frameTimestamps.length - 1];
		}

		await ensureEnoughFramesForTimestamp(adjustedTimestamp, parentLogLevel);

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

		// Return first frame we have
		return frames[frameTimestamps[0]] ?? null;
	};

	const hasTimestampInSecond = async (timestamp: number) => {
		return (await getFrameFromTimestamp(timestamp)) !== null;
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

	const firstFrame = await sampleIterator.next();
	if (!firstFrame.value) {
		throw new Error('No first frame found');
	}

	const startTimestampInSeconds = firstFrame.value.timestamp;

	Internals.Log.verbose(
		{logLevel: parentLogLevel, tag: '@remotion/media'},
		`Creating keyframe bank from ${startTimestampInSeconds}sec`,
	);
	addFrame(firstFrame.value, parentLogLevel);

	const getRangeOfTimestamps = () => {
		if (frameTimestamps.length === 0) {
			return null;
		}

		return {
			firstTimestamp: frameTimestamps[0],
			lastTimestamp: frameTimestamps[frameTimestamps.length - 1],
		};
	};

	const prepareForDeletion = (logLevel: LogLevel, reason: string) => {
		const range = getRangeOfTimestamps();
		if (range) {
			Internals.Log.verbose(
				{logLevel, tag: '@remotion/media'},
				`Preparing for deletion (${reason}) of keyframe bank from ${range?.firstTimestamp}sec to ${range?.lastTimestamp}sec`,
			);
		}

		let framesDeleted = 0;

		for (const frameTimestamp of frameTimestamps.slice()) {
			if (!frames[frameTimestamp]) {
				continue;
			}

			deleteFrameAtTimestamp(frameTimestamp);
			framesDeleted++;
		}

		// Cleanup frames that have been extracted that might not have been retrieved yet
		// Must be called after closing the frames
		sampleIterator.return();

		frameTimestamps.length = 0;
		return {framesDeleted};
	};

	const canSatisfyTimestamp = (timestamp: number) => {
		if (frameTimestamps.length === 0) {
			return false;
		}

		const roundedTimestamp = roundTo4Digits(timestamp);
		const firstFrameTimestamp = roundTo4Digits(frameTimestamps[0]);
		const lastFrameTimestamp = roundTo4Digits(
			frameTimestamps[frameTimestamps.length - 1],
		);

		if (hasReachedEndOfVideo && roundedTimestamp > lastFrameTimestamp) {
			return true;
		}

		if (roundedTimestamp < firstFrameTimestamp) {
			return false;
		}

		if (
			roundedTimestamp - BIGGEST_ALLOWED_JUMP_FORWARD_SECONDS >
			lastFrameTimestamp
		) {
			return false;
		}

		return true;
	};

	const keyframeBank: KeyframeBank = {
		getFrameFromTimestamp: (timestamp: number) => {
			queue = queue.then(() => getFrameFromTimestamp(timestamp));
			return queue as Promise<VideoSample | null>;
		},
		prepareForDeletion,
		hasTimestampInSecond: (timestamp: number) => {
			queue = queue.then(() => hasTimestampInSecond(timestamp));
			return queue as Promise<boolean>;
		},
		addFrame,
		deleteFramesBeforeTimestamp,
		src,
		getOpenFrameCount,
		getLastUsed,
		canSatisfyTimestamp,
		getRangeOfTimestamps,
	};

	return keyframeBank;
};
