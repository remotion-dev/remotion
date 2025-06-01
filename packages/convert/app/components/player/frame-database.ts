import {
	WEBCODECS_TIMESCALE,
	type MediaParserVideoSample,
} from '@remotion/media-parser';
import {FrameDatabaseEmitter} from './frame-database-emitter';

type GroupOfPicture = {
	startingTimestamp: number;
	frames: VideoFrame[];
};

type SerializedGroupOfPicture = {
	startingTimestamp: number;
	frames: number[];
};

const makeGroupOfPicture = (sample: MediaParserVideoSample) => {
	return {
		startingTimestamp: Math.min(sample.timestamp, sample.decodingTimestamp),
		frames: [],
	};
};

export const findGroupForTimestamp = ({
	groups,
	timestamp,
}: {
	groups: GroupOfPicture[];
	timestamp: number;
}) => {
	return groups
		.filter((g) => g.startingTimestamp <= timestamp)
		.sort((a, b) => b.startingTimestamp - a.startingTimestamp)[0];
};

export const makeFrameDatabase = () => {
	const groups: GroupOfPicture[] = [];
	const emitter = new FrameDatabaseEmitter();

	const waiters: Array<{
		resolve: (canceled: boolean) => void;
		threshold: number;
	}> = [];

	const getLength = () => {
		let totalLength = 0;
		for (const group of groups) {
			totalLength += group.frames.length;
		}

		return totalLength;
	};

	const checkWaiters = () => {
		waiters.forEach((waiter, index) => {
			if (getLength() < waiter.threshold) {
				waiter.resolve(false);
				waiters.splice(index, 1);
			}
		});
	};

	return {
		startNewGop: (sample: MediaParserVideoSample) => {
			const group = makeGroupOfPicture(sample);
			if (groups.find((g) => group.startingTimestamp === g.startingTimestamp)) {
				return;
			}

			console.log('new gop', sample.timestamp);

			groups.push(group);
		},
		addFrame: (frame: VideoFrame) => {
			// Find the group with the largest startingTimestamp <= frame.timestamp
			const group = findGroupForTimestamp({
				groups,
				timestamp: frame.timestamp,
			});
			if (!group) {
				throw new Error('No group found for frame');
			}

			const alreadyInGroup = group.frames.find(
				(f) => f.timestamp === frame.timestamp,
			);
			if (alreadyInGroup) {
				alreadyInGroup.close();
			}

			group.frames.push(frame);
			group.frames.sort((a, b) => a.timestamp - b.timestamp);

			emitter.dispatchQueueChanged();
		},
		getFrameForTimeAndDiscardEarlier: (time: number) => {
			const group = findGroupForTimestamp({
				groups,
				timestamp: time,
			});

			if (!group) {
				throw new Error('No group found for time');
			}

			const index = group.frames.findIndex(
				(f) => f.timestamp >= time * WEBCODECS_TIMESCALE,
			);
			if (index === -1) {
				throw new Error('No frame found for time');
			}

			const takenOutFrames = group.frames.splice(0, index + 1);
			for (const frame of takenOutFrames) {
				const isLast = frame === takenOutFrames[takenOutFrames.length - 1];
				if (!isLast) {
					frame.close();
				}
			}

			checkWaiters();
			emitter.dispatchQueueChanged();

			return takenOutFrames[takenOutFrames.length - 1];
		},
		waitForQueueToBeLessThan: (n: number) => {
			if (getLength() < n) {
				return Promise.resolve(false);
			}

			return new Promise<boolean>((resolve) => {
				waiters.push({
					resolve,
					threshold: n,
				});
			});
		},
		_groups: groups,
		getGroups: (): SerializedGroupOfPicture[] => {
			return groups.map((g) => ({
				startingTimestamp: g.startingTimestamp,
				frames: g.frames.map((f) => f.timestamp),
			}));
		},
		emitter,
	};
};

export type FrameDatabase = ReturnType<typeof makeFrameDatabase>;
