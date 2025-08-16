import {
	WEBCODECS_TIMESCALE,
	type MediaParserVideoSample,
} from '@remotion/media-parser';
import {FrameDatabaseEmitter} from './frame-database-emitter';
import {SEEK_TOLERANCE_IN_SECONDS} from './seek-logic';

type FrameAndLoopIndex = {
	frame: VideoFrame;
	loopIndex: number;
};

type GroupOfPicture = {
	startingTimestamp: number;
	frames: FrameAndLoopIndex[];
};

type SerializedFrameAndLoopIndex = {
	frame: number;
	loopIndex: number;
};

type SerializedGroupOfPicture = {
	startingTimestamp: number;
	frames: SerializedFrameAndLoopIndex[];
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
			if (frame.frame.timestamp < timestamp) {
				continue;
			}

			const distance = Math.abs(frame.frame.timestamp - timestamp);
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

	const getNextFrameForTimestamp = (
		currentTime: number,
		removeFromDb: boolean,
	) => {
		if (lastFrame !== null && currentTime === lastFrame) {
			return getNextFrameForTimestamp(0, removeFromDb);
		}

		const group = findGroupForGettingTimestamp({
			groups,
			timestamp: currentTime,
		});

		if (!group) {
			throw new Error('No group found for time');
		}

		let closestIndex = -1;
		let closestDiff = Infinity;
		group.frames.forEach((f, i) => {
			const timeDiff = Math.abs(f.frame.timestamp - currentTime);
			if (
				timeDiff <= SEEK_TOLERANCE_IN_SECONDS * WEBCODECS_TIMESCALE &&
				timeDiff < closestDiff
			) {
				closestDiff = timeDiff;
				closestIndex = i;
			}
		});
		const index = closestIndex;
		if (index === -1) {
			return null;
		}

		if (removeFromDb) {
			const takenOutFrames = group.frames.splice(index, 1);
			checkWaiters();
			emitter.dispatchQueueChanged();

			return takenOutFrames[0];
		}

		return group.frames[index];
	};

	const setLastFrame = () => {
		let biggestTimestampt = 0;
		for (const group of groups) {
			for (const frame of group.frames) {
				if (frame.frame.timestamp > biggestTimestampt) {
					biggestTimestampt = frame.frame.timestamp;
				}
			}
		}

		lastFrame = biggestTimestampt;
	};

	const clearFramesBeforeTimestampFromGroup = ({
		deleteFramesBeforeTimestamp,
		groupStartingTimestamp,
	}: {
		deleteFramesBeforeTimestamp: number;
		groupStartingTimestamp: number;
	}) => {
		for (const group of groups) {
			if (group.startingTimestamp === groupStartingTimestamp) {
				const newFrames: FrameAndLoopIndex[] = [];
				for (const frame of group.frames) {
					if (frame.frame.timestamp >= deleteFramesBeforeTimestamp) {
						newFrames.push(frame);
					} else {
						frame.frame.close();
					}
				}

				group.frames = newFrames;
			}
		}

		checkWaiters();
		emitter.dispatchQueueChanged();
	};

	const clearGroup = (groupStartingTimestamp: number) => {
		const group = groups.find(
			(g) => g.startingTimestamp === groupStartingTimestamp,
		);
		if (!group) {
			throw new Error('Group not found');
		}

		group.frames.forEach((f) => f.frame.close());
		group.frames = [];

		checkWaiters();
		emitter.dispatchQueueChanged();
	};

	const clearDatabase = () => {
		groups.forEach((g) => {
			g.frames.forEach((f) => f.frame.close());
			g.frames = [];
		});
		checkWaiters();
		emitter.dispatchQueueChanged();
	};

	return {
		startNewGop: (sample: MediaParserVideoSample) => {
			const group = makeGroupOfPicture(sample);
			if (groups.find((g) => group.startingTimestamp === g.startingTimestamp)) {
				return;
			}

			groups.push(group);
		},
		addFrame: (frame: VideoFrame, loopIndex: number) => {
			// Find the group with the largest startingTimestamp <= frame.timestamp
			const group = findGroupForInsertingTimestamp({
				groups,
				timestamp: frame.timestamp,
			});
			if (!group) {
				throw new Error('No group found for frame');
			}

			const alreadyInGroup = group.frames.find(
				(f) => f.frame.timestamp === frame.timestamp,
			);
			if (alreadyInGroup) {
				alreadyInGroup.frame.close();
				// remove the frame from the group
				group.frames.splice(group.frames.indexOf(alreadyInGroup), 1);
			}

			group.frames.push({frame, loopIndex});
			group.frames.sort((a, b) => a.frame.timestamp - b.frame.timestamp);

			emitter.dispatchQueueChanged();
		},
		getNextFrameForTimestamp,
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
				frames: g.frames.map((f) => ({
					frame: f.frame.timestamp,
					loopIndex: f.loopIndex,
				})),
			}));
		},
		getLastFrame: () => lastFrame,
		setLastFrame,
		clearFramesBeforeTimestampFromGroup,
		clearGroup,
		clearDatabase,
		emitter,
	};
};

export type FrameDatabase = ReturnType<typeof makeFrameDatabase>;
