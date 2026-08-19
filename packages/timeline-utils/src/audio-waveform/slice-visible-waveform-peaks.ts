import type {TimelineLoopDisplay} from '../loop-display';
import {shouldTileLoopDisplay} from '../loop-display';
import {sliceWaveformPeaks} from './slice-waveform-peaks';

export const sliceVisibleWaveformPeaks = ({
	displayDurationInFrames,
	displayOffsetInFrames,
	durationInFrames,
	fps,
	loopDisplay,
	peaks,
	playbackRate,
	startFrom,
}: {
	readonly displayDurationInFrames: number;
	readonly displayOffsetInFrames: number;
	readonly durationInFrames: number;
	readonly fps: number;
	readonly loopDisplay: TimelineLoopDisplay | undefined;
	readonly peaks: Float32Array;
	readonly playbackRate: number;
	readonly startFrom: number;
}) => {
	if (!shouldTileLoopDisplay(loopDisplay)) {
		return sliceWaveformPeaks({
			durationInFrames: Math.min(
				displayDurationInFrames,
				Math.max(0, durationInFrames - displayOffsetInFrames),
			),
			fps,
			peaks,
			playbackRate,
			startFrom: startFrom + displayOffsetInFrames * playbackRate,
		});
	}

	const parts: Float32Array[] = [];
	let processed = 0;
	let totalLength = 0;
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

		const part = sliceWaveformPeaks({
			durationInFrames: segmentDuration,
			fps,
			peaks,
			playbackRate,
			startFrom: startFrom + loopOffset * playbackRate,
		});
		parts.push(part);
		totalLength += part.length;
		processed += segmentDuration;
	}

	if (parts.length === 1) {
		return parts[0];
	}

	const result = new Float32Array(totalLength);
	let writeOffset = 0;
	for (const part of parts) {
		result.set(part, writeOffset);
		writeOffset += part.length;
	}

	return result;
};
