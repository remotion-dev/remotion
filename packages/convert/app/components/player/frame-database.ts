import {type MediaParserVideoSample} from '@remotion/media-parser';
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

export const findGroupForInsertingTimestamp = ({
	groups,
	timestamp,
}: {
	groups: GroupOfPicture[];
	timestamp: number;
}) => {
	const possibleGroups = groups
		.filter((g) => g.startingTimestamp <= timestamp)
		.sort((a, b) => b.startingTimestamp - a.startingTimestamp);

	return possibleGroups[0];
};

export const findGroupForGettingTimestamp = ({
	groups,
	timestamp,
}: {
	groups: GroupOfPicture[];
	timestamp: number;
}) => {
	const possibleGroups = groups;

	if (possibleGroups.length === 0) {
		return null;
	}

	if (possibleGroups.length === 1) {
		return possibleGroups[0];
	}

	let closestDistance = Infinity;
	let closestGroup = possibleGroups[0];

	for (const group of possibleGroups) {
		for (const frame of group.frames) {
			if (frame.timestamp < timestamp) {
				continue;
			}

			const distance = Math.abs(frame.timestamp - timestamp);
			if (distance < closestDistance) {
				closestGroup = group;
				closestDistance = distance;
			}
		}
	}

	return closestGroup;
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

	let lastFrame: number | null = null;

	const getNextFrameForTimestampAndDiscardEarlier = (currentTime: number) => {
		if (lastFrame !== null && currentTime === lastFrame) {
			return getNextFrameForTimestampAndDiscardEarlier(0);
		}

		const group = findGroupForGettingTimestamp({
			groups,
			timestamp: currentTime,
		});

		if (!group) {
			throw new Error('No group found for time');
		}

		const index = group.frames.findIndex((f) => f.timestamp >= currentTime);
		if (index === -1) {
			throw new Error('No frame found for time');
		}

		const takenOutFrames = group.frames.splice(index, 1);

		checkWaiters();
		emitter.dispatchQueueChanged();

		return takenOutFrames[0];
	};

	const setLastFrame = () => {
		let biggestTimestampt = 0;
		for (const group of groups) {
			for (const frame of group.frames) {
				if (frame.timestamp > biggestTimestampt) {
					biggestTimestampt = frame.timestamp;
				}
			}
		}

		lastFrame = biggestTimestampt;
	};

	return {
		startNewGop: (sample: MediaParserVideoSample) => {
			const group = makeGroupOfPicture(sample);
			if (groups.find((g) => group.startingTimestamp === g.startingTimestamp)) {
				return;
			}

			groups.push(group);
		},
		addFrame: (frame: VideoFrame) => {
			// Find the group with the largest startingTimestamp <= frame.timestamp
			const group = findGroupForInsertingTimestamp({
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
				// remove the frame from the group
				group.frames.splice(group.frames.indexOf(alreadyInGroup), 1);
			}

			group.frames.push(frame);
			group.frames.sort((a, b) => a.timestamp - b.timestamp);

			emitter.dispatchQueueChanged();
		},
		getNextFrameForTimestampAndDiscardEarlier,
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
		getLastFrame: () => lastFrame,
		setLastFrame,
		emitter,
	};
};

export type FrameDatabase = ReturnType<typeof makeFrameDatabase>;
