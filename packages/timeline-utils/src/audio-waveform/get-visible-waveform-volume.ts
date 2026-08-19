import {shouldTileLoopDisplay, type TimelineLoopDisplay} from '../loop-display';
import type {WaveformVolume} from './draw-peaks';

export const getVisibleWaveformVolume = ({
	displayDurationInFrames,
	displayOffsetInFrames,
	loopDisplay,
	volume,
}: {
	readonly displayDurationInFrames: number;
	readonly displayOffsetInFrames: number;
	readonly loopDisplay: TimelineLoopDisplay | undefined;
	readonly volume: WaveformVolume;
}): WaveformVolume => {
	if (!Array.isArray(volume)) {
		return volume;
	}

	if (
		!Number.isFinite(displayDurationInFrames) ||
		displayDurationInFrames <= 0
	) {
		return [];
	}

	if (
		!shouldTileLoopDisplay(loopDisplay) ||
		loopDisplay.durationInFrames <= 0
	) {
		const start = Math.max(0, Math.floor(displayOffsetInFrames));
		const end = Math.min(
			volume.length,
			Math.ceil(displayOffsetInFrames + displayDurationInFrames),
		);
		return volume.slice(start, end);
	}

	const result: number[] = [];
	let processed = 0;
	while (processed < displayDurationInFrames) {
		const absoluteOffset = displayOffsetInFrames + processed;
		const loopOffset =
			((absoluteOffset % loopDisplay.durationInFrames) +
				loopDisplay.durationInFrames) %
			loopDisplay.durationInFrames;
		const segmentDuration = Math.min(
			displayDurationInFrames - processed,
			loopDisplay.durationInFrames - loopOffset,
		);
		if (segmentDuration <= 0) {
			break;
		}

		const start = Math.max(0, Math.floor(loopOffset));
		const end = Math.min(
			volume.length,
			Math.ceil(loopOffset + segmentDuration),
		);
		// Do not `push(...slice)`: Chrome throws RangeError: Invalid array length
		// once a loop segment is longer than ~65k frames.
		for (let index = start; index < end; index++) {
			result.push(volume[index]);
		}

		processed += segmentDuration;
	}

	return result;
};
