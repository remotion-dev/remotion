import type {TimelineLoopDisplay} from '../loop-display';
import {getLoopDisplaySegments, shouldTileLoopDisplay} from '../loop-display';
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
	if (
		!shouldTileLoopDisplay(loopDisplay) ||
		loopDisplay.durationInFrames <= 0
	) {
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

	const segments = getLoopDisplaySegments({
		displayDurationInFrames,
		displayOffsetInFrames,
		loopDurationInFrames: loopDisplay.durationInFrames,
	});

	const parts: Float32Array[] = [];
	let totalLength = 0;
	for (const segment of segments) {
		const part = sliceWaveformPeaks({
			durationInFrames: segment.durationInFrames,
			fps,
			peaks,
			playbackRate,
			startFrom: startFrom + segment.loopOffsetInFrames * playbackRate,
		});
		parts.push(part);
		totalLength += part.length;
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
