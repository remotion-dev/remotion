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
	return `${samplePositionTrack.track.trackId}-${samplePositionTrack.samplePosition.decodingTimestamp}`;
};

const findBestJump = ({
	allSamplesSortedByOffset,
	visited,
	progresses,
}: {
	allSamplesSortedByOffset: MinimalFlatSampleForTesting[];
	visited: Set<string>;
	progresses: Record<number, number>;
}) => {
	const minProgress = Math.min(...Object.values(progresses));

	const trackNumberWithLowestProgress = Object.entries(progresses).find(
		([, progress]) => progress === minProgress,
	)?.[0];

	const firstSampleAboveMinProgress = allSamplesSortedByOffset.findIndex(
		(sample) =>
			sample.track.trackId === Number(trackNumberWithLowestProgress) &&
			!visited.has(getKey(sample)),
	);

	return firstSampleAboveMinProgress;
};

export const calculateJumpMarks = (
	samplePositionTracks: MinimalFlatSampleForTesting[][],
	endOfMdat: number,
) => {
	const progresses: Record<number, number> = {};
	for (const track of samplePositionTracks) {
		progresses[track[0].track.trackId] = 0;
	}

	const jumpMarks: JumpMark[] = [];

	const allSamplesSortedByOffset = samplePositionTracks
		.flat(1)
		.sort((a, b) => a.samplePosition.offset - b.samplePosition.offset);

	let indexToVisit = 0;

	const visited = new Set<string>();

	let rollOverToProcess = false;

	const increaseIndex = () => {
		indexToVisit++;
		if (indexToVisit >= allSamplesSortedByOffset.length) {
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
			jumpToOffset:
				allSamplesSortedByOffset[firstSampleAboveMinProgress].samplePosition
					.offset,
		};

		indexToVisit = firstSampleAboveMinProgress;

		jumpMarks.push(jumpMark);
	};

	const addFinalJumpIfNecessary = () => {
		if (indexToVisit === allSamplesSortedByOffset.length - 1) {
			return;
		}

		jumpMarks.push({
			afterSampleWithOffset:
				allSamplesSortedByOffset[indexToVisit].samplePosition.offset,
			jumpToOffset: endOfMdat,
		});
	};

	const considerJump = () => {
		const firstSampleAboveMinProgress = findBestJump({
			allSamplesSortedByOffset,
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
				if (!visited.has(getKey(allSamplesSortedByOffset[indexToVisit]))) {
					break;
				}
			}
		}
	};

	while (true) {
		const currentSamplePosition = allSamplesSortedByOffset[indexToVisit];

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

		if (visited.size === allSamplesSortedByOffset.length) {
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

		if (visited.size === allSamplesSortedByOffset.length) {
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
