/* 
  https://discord.com/channels/809501355504959528/1001500302375125055/1364798934832119870
  Android 13 produces MP4 videos where first, all video samples are at the beginning,
  then all audio samples are at the end.

  This causes issues with our video decoder: "Waited too long for VideoDecoder" because
  the overall progress is stuck.
*/

import type {MinimalFlatSampleForTesting} from '../../../state/iso-base-media/cached-sample-positions';

const MAX_SPREAD_IN_SECONDS = 10;

export type JumpMark = {
	afterSampleWithOffset: number;
	jumpToOffset: number;
};

const getKey = (samplePositionTrack: MinimalFlatSampleForTesting) => {
	return `${samplePositionTrack.track.trackId}-${samplePositionTrack.samplePosition.dts}`;
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
	const progressValues = Object.values(progresses);

	const minProgress = Math.min(...progressValues);

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

	const increaseIndex = () => {
		indexToVisit++;
		if (indexToVisit >= allSamplesSortedByOffset.length) {
			indexToVisit = 0;
		}
	};

	const addJumpMark = ({
		currentSamplePosition,
		firstSampleAboveMinProgress,
	}: {
		currentSamplePosition: MinimalFlatSampleForTesting;
		firstSampleAboveMinProgress: number;
	}) => {
		const jumpMark: JumpMark = {
			afterSampleWithOffset: currentSamplePosition.samplePosition.offset,
			jumpToOffset:
				allSamplesSortedByOffset[firstSampleAboveMinProgress].samplePosition
					.offset,
		};

		indexToVisit = firstSampleAboveMinProgress;

		jumpMarks.push(jumpMark);
	};

	const considerJump = (currentSamplePosition: MinimalFlatSampleForTesting) => {
		const firstSampleAboveMinProgress = findBestJump({
			allSamplesSortedByOffset,
			visited,
			progresses,
		});

		if (
			firstSampleAboveMinProgress > -1 &&
			firstSampleAboveMinProgress !== indexToVisit + 1
		) {
			addJumpMark({currentSamplePosition, firstSampleAboveMinProgress});
		} else {
			increaseIndex();
		}
	};

	while (true) {
		if (visited.size === allSamplesSortedByOffset.length) {
			break;
		}

		const currentSamplePosition = allSamplesSortedByOffset[indexToVisit];

		const sampleKey = getKey(currentSamplePosition);
		if (visited.has(sampleKey)) {
			considerJump(currentSamplePosition);

			continue;
		}

		visited.add(sampleKey);

		progresses[currentSamplePosition.track.trackId] =
			currentSamplePosition.samplePosition.dts /
			currentSamplePosition.track.timescale;

		const progressValues = Object.values(progresses);

		const maxProgress = Math.max(...progressValues);
		const minProgress = Math.min(...progressValues);

		const spread = maxProgress - minProgress;

		if (spread > MAX_SPREAD_IN_SECONDS) {
			considerJump(currentSamplePosition);
		} else {
			increaseIndex();
		}
	}

	return jumpMarks;
};
