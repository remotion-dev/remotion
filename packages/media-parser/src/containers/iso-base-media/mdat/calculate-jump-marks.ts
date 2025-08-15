/* 
  https://discord.com/channels/809501355504959528/1001500302375125055/1364798934832119870
  Android 13 produces MP4 videos where first, all video samples are at the beginning,
  then all audio samples are at the end.

  This causes issues with our video decoder: "Waited too long for VideoDecoder" because
  the overall progress is stuck.
*/

import type {MinimalFlatSampleForTesting} from '../../../state/iso-base-media/cached-sample-positions';

// In WebCodecs, we require the tracks to deviate by at most 10 seconds
// Therefore, we need to emit them to be less than 10 seconds apart
const MAX_SPREAD_IN_SECONDS = 8;

export type JumpMark = {
	afterSampleWithOffset: number;
	jumpToOffset: number;
};

const getKey = (samplePositionTrack: MinimalFlatSampleForTesting) => {
	return `${samplePositionTrack.track.trackId}-${samplePositionTrack.samplePosition.decodingTimestamp}.${samplePositionTrack.samplePosition.offset}`;
};

const findBestJump = ({
	sampleMap,
	offsetsSorted,
	visited,
	progresses,
}: {
	sampleMap: Map<number, MinimalFlatSampleForTesting>;
	offsetsSorted: number[];
	visited: Map<string, true>;
	progresses: Record<number, number>;
}) => {
	const minProgress = Math.min(...Object.values(progresses));

	const trackNumberWithLowestProgress = Object.entries(progresses).find(
		([, progress]) => progress === minProgress,
	)?.[0];

	const firstSampleAboveMinProgress = offsetsSorted.findIndex((offset) => {
		const sample = sampleMap.get(offset)!;
		return (
			sample.track.trackId === Number(trackNumberWithLowestProgress) &&
			!visited.has(getKey(sample))
		);
	});

	if (firstSampleAboveMinProgress === -1) {
		// Track might be done, so we don't care about minimum progress
		// then
		const backup = offsetsSorted.findIndex(
			(offset) => !visited.has(getKey(sampleMap.get(offset)!)),
		);
		if (backup === -1) {
			throw new Error('this should not happen');
		}

		return backup;
	}

	return firstSampleAboveMinProgress;
};

export const calculateJumpMarks = ({
	sampleMap,
	offsetsSorted,
	trackIds,
	endOfMdat,
}: {
	sampleMap: Map<number, MinimalFlatSampleForTesting>;
	offsetsSorted: number[];
	trackIds: number[];
	endOfMdat: number;
}) => {
	const progresses: Record<number, number> = {};
	for (const trackId of trackIds) {
		progresses[trackId] = 0;
	}

	const jumpMarks: JumpMark[] = [];

	let indexToVisit = 0;

	const visited = new Map<string, true>();

	const increaseIndex = () => {
		indexToVisit++;
		if (indexToVisit >= offsetsSorted.length) {
			throw new Error('should not roll over, should jump');
		}
	};

	let lastVisitedSample: MinimalFlatSampleForTesting | null = null;

	const addJumpMark = ({
		firstSampleAboveMinProgress,
	}: {
		firstSampleAboveMinProgress: number;
	}) => {
		if (!lastVisitedSample) {
			throw new Error('no last visited sample');
		}

		const jumpMark: JumpMark = {
			afterSampleWithOffset: lastVisitedSample.samplePosition.offset,
			jumpToOffset: offsetsSorted[firstSampleAboveMinProgress],
		};

		if (
			firstSampleAboveMinProgress ===
			offsetsSorted.indexOf(lastVisitedSample.samplePosition.offset) + 1
		) {
			indexToVisit = firstSampleAboveMinProgress;
			return;
		}

		indexToVisit = firstSampleAboveMinProgress;

		jumpMarks.push(jumpMark);
	};

	const addFinalJumpIfNecessary = () => {
		if (indexToVisit === offsetsSorted.length - 1) {
			return;
		}

		jumpMarks.push({
			afterSampleWithOffset: offsetsSorted[indexToVisit],
			jumpToOffset: endOfMdat,
		});
	};

	const considerJump = () => {
		const firstSampleAboveMinProgress = findBestJump({
			sampleMap,
			offsetsSorted,
			visited,
			progresses,
		});

		addJumpMark({firstSampleAboveMinProgress});
	};

	while (true) {
		const currentSamplePosition = sampleMap.get(offsetsSorted[indexToVisit])!;

		const sampleKey = getKey(currentSamplePosition);
		if (visited.has(sampleKey)) {
			considerJump();
			continue;
		}

		visited.set(sampleKey, true);

		lastVisitedSample = currentSamplePosition;

		if (visited.size === offsetsSorted.length) {
			addFinalJumpIfNecessary();
			break;
		}

		const timestamp =
			currentSamplePosition.samplePosition.decodingTimestamp /
			currentSamplePosition.track.originalTimescale;

		progresses[currentSamplePosition.track.trackId] = timestamp;

		const progressValues = Object.values(progresses);

		const maxProgress = Math.max(...progressValues);
		const minProgress = Math.min(...progressValues);

		const spread = maxProgress - minProgress;

		if (visited.size === offsetsSorted.length) {
			addFinalJumpIfNecessary();
			break;
		}

		// Also don't allow audio progress to go more
		if (spread > MAX_SPREAD_IN_SECONDS) {
			considerJump();
		} else if (indexToVisit === offsetsSorted.length - 1) {
			considerJump();
		} else {
			increaseIndex();
		}
	}

	return jumpMarks;
};
