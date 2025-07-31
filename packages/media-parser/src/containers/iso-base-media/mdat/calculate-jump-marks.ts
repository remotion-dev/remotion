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
	visited: Set<string>;
	progresses: Record<number, number>;
}) => {
	const minProgress = Math.min(...Object.values(progresses));

	const trackNumberWithLowestProgress = Object.entries(progresses).find(
		([, progress]) => progress === minProgress,
	)?.[0];

	const firstSampleAboveMinProgress = offsetsSorted.findIndex(
		(offset) =>
			sampleMap.get(offset)!.track.trackId ===
				Number(trackNumberWithLowestProgress) &&
			!visited.has(getKey(sampleMap.get(offset)!)),
	);

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

	const visited = new Set<string>();

	let rollOverToProcess = false;

	const increaseIndex = () => {
		indexToVisit++;
		if (indexToVisit >= offsetsSorted.length) {
			rollOverToProcess = true;
			indexToVisit = 0;
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

		if (
			firstSampleAboveMinProgress > -1 &&
			firstSampleAboveMinProgress !== indexToVisit + 1
		) {
			addJumpMark({firstSampleAboveMinProgress});
			indexToVisit = firstSampleAboveMinProgress;
		} else {
			while (true) {
				increaseIndex();
				if (!visited.has(getKey(sampleMap.get(offsetsSorted[indexToVisit])!))) {
					break;
				}
			}
		}
	};

	while (true) {
		const currentSamplePosition = sampleMap.get(offsetsSorted[indexToVisit])!;

		const sampleKey = getKey(currentSamplePosition);
		if (visited.has(sampleKey)) {
			considerJump();
			continue;
		}

		visited.add(sampleKey);

		if (rollOverToProcess) {
			if (!lastVisitedSample) {
				throw new Error('no last visited sample');
			}

			jumpMarks.push({
				afterSampleWithOffset: lastVisitedSample.samplePosition.offset,
				jumpToOffset: currentSamplePosition.samplePosition.offset,
			});
			rollOverToProcess = false;
		}

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
		} else {
			increaseIndex();
		}
	}

	return jumpMarks;
};
