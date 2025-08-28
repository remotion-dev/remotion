import type {VideoSample} from 'mediabunny';
import type {LogLevel} from './log';
import {Log} from './log';

export type KeyframeBank = {
	startTimestampInSeconds: number;
	endTimestampInSeconds: number;
	getFrameFromTimestamp: (timestamp: number) => Promise<VideoSample | null>;
	prepareForDeletion: () => void;
	deleteFramesBeforeTimestamp: (
		timestamp: number,
		logLevel: LogLevel,
		src: string,
	) => void;
	hasTimestampInSecond: (timestamp: number) => Promise<boolean>;
	addFrame: (frame: VideoSample) => void;
	getOpenFrameCount: () => number;
};

export const makeKeyframeBank = ({
	startTimestampInSeconds,
	endTimestampInSeconds,
}: {
	startTimestampInSeconds: number;
	endTimestampInSeconds: number;
}) => {
	const frames: Record<number, VideoSample> = {};
	const frameTimestamps: number[] = [];

	const getFrameFromTimestamp = (
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

		for (let i = frameTimestamps.length - 1; i >= 0; i--) {
			const sample = frames[frameTimestamps[i]];
			if (!sample) {
				return Promise.resolve(null);
			}

			if (sample.timestamp <= timestampInSeconds) {
				return Promise.resolve(sample);
			}
		}

		return Promise.reject(
			new Error('No frame found for timestamp ' + timestampInSeconds),
		);
	};

	const hasTimestampInSecond = async (timestamp: number) => {
		return (await getFrameFromTimestamp(timestamp)) !== null;
	};

	const prepareForDeletion = () => {
		for (const frameTimestamp of frameTimestamps) {
			if (!frames[frameTimestamp]) {
				continue;
			}

			frames[frameTimestamp].close();
			delete frames[frameTimestamp];
		}

		frameTimestamps.length = 0;
	};

	const addFrame = (frame: VideoSample) => {
		frames[frame.timestamp] = frame;
		frameTimestamps.push(frame.timestamp);
	};

	const deleteFramesBeforeTimestamp = (
		timestampInSeconds: number,
		logLevel: LogLevel,
		src: string,
	) => {
		for (const frameTimestamp of frameTimestamps) {
			if (frameTimestamp < timestampInSeconds) {
				if (!frames[frameTimestamp]) {
					continue;
				}

				frames[frameTimestamp].close();
				delete frames[frameTimestamp];
				Log.verbose(logLevel, `Deleted frame ${frameTimestamp} for src ${src}`);
			}
		}
	};

	const getOpenFrameCount = () => {
		return frameTimestamps.map((timestamp) => frames[timestamp]).filter(Boolean)
			.length;
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
