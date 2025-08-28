import type {LogLevel} from './log';
import {Log} from './log';

export type KeyframeBank = {
	startTimestampInSeconds: number;
	endTimestampInSeconds: number;
	getFrameFromTimestamp: (timestamp: number) => Promise<VideoFrame | null>;
	prepareForDeletion: () => void;
	deleteFramesBeforeTimestamp: (
		timestamp: number,
		logLevel: LogLevel,
		src: string,
	) => void;
	hasTimestampInSecond: (timestamp: number) => Promise<boolean>;
	addFrame: (frame: VideoFrame) => void;
};

export const makeKeyframeBank = ({
	startTimestampInSeconds,
	endTimestampInSeconds,
}: {
	startTimestampInSeconds: number;
	endTimestampInSeconds: number;
}) => {
	const frames: Record<number, VideoFrame> = {};
	const frameTimestamps: number[] = [];

	const getFrameFromTimestamp = (
		timestampInSeconds: number,
	): Promise<VideoFrame | null> => {
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
			const frame = frames[frameTimestamps[i]];
			if (!frame) {
				return Promise.resolve(null);
			}

			if (frame.timestamp <= timestampInSeconds * 1_000_000) {
				return Promise.resolve(frame);
			}
		}

		return Promise.reject(
			new Error('No frame found for timestamp ' + timestampInSeconds),
		);
	};

	const hasTimestampInSecond = async (timestamp: number) => {
		// TODO: When able to delete frames,
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

	const addFrame = (frame: VideoFrame) => {
		frames[frame.timestamp] = frame;
		frameTimestamps.push(frame.timestamp);
	};

	const deleteFramesBeforeTimestamp = (
		timestamp: number,
		logLevel: LogLevel,
		src: string,
	) => {
		for (const frameTimestamp of frameTimestamps) {
			if (frameTimestamp < timestamp * 1_000_000) {
				if (!frames[frameTimestamp]) {
					continue;
				}

				frames[frameTimestamp].close();
				delete frames[frameTimestamp];
				Log.verbose(logLevel, `Deleted frame ${frameTimestamp} for src ${src}`);
			}
		}
	};

	const keyframeBank: KeyframeBank = {
		startTimestampInSeconds,
		endTimestampInSeconds,
		getFrameFromTimestamp,
		prepareForDeletion,
		hasTimestampInSecond,
		addFrame,
		deleteFramesBeforeTimestamp,
	};

	return keyframeBank;
};
