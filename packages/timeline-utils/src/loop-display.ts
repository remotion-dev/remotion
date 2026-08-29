export type TimelineLoopDisplay = {
	durationInFrames: number;
	numberOfTimes: number;
	startOffset: number;
};

export const shouldTileLoopDisplay = (
	loopDisplay: TimelineLoopDisplay | undefined,
): loopDisplay is TimelineLoopDisplay => {
	return loopDisplay !== undefined && loopDisplay.numberOfTimes > 1;
};

export type LoopDisplaySegment = {
	loopIndex: number;
	// Offset of the segment relative to the start of the tiled display window origin
	absoluteOffsetInFrames: number;
	// Offset within the loop iteration
	loopOffsetInFrames: number;
	durationInFrames: number;
};

// Computes the visible loop segments by loop index instead of accumulating
// floating-point segment durations. With fractional display offsets (e.g. from
// horizontal timeline virtualization), an accumulating `processed += segment`
// loop can stall once the residue is smaller than the ULP of `processed`,
// growing arrays unboundedly until the tab runs out of memory.
export const getLoopDisplaySegments = ({
	displayDurationInFrames,
	displayOffsetInFrames,
	loopDurationInFrames,
}: {
	readonly displayDurationInFrames: number;
	readonly displayOffsetInFrames: number;
	readonly loopDurationInFrames: number;
}): LoopDisplaySegment[] => {
	if (
		!Number.isFinite(displayDurationInFrames) ||
		displayDurationInFrames <= 0 ||
		!Number.isFinite(displayOffsetInFrames) ||
		!Number.isFinite(loopDurationInFrames) ||
		loopDurationInFrames <= 0
	) {
		return [];
	}

	const displayEndInFrames = displayOffsetInFrames + displayDurationInFrames;
	const firstLoopIndex = Math.floor(
		displayOffsetInFrames / loopDurationInFrames,
	);
	const lastLoopIndex = Math.floor(displayEndInFrames / loopDurationInFrames);

	const segments: LoopDisplaySegment[] = [];
	for (
		let loopIndex = firstLoopIndex;
		loopIndex <= lastLoopIndex;
		loopIndex++
	) {
		const loopStartInFrames = loopIndex * loopDurationInFrames;
		const segmentStart = Math.max(displayOffsetInFrames, loopStartInFrames);
		const segmentEnd = Math.min(
			displayEndInFrames,
			loopStartInFrames + loopDurationInFrames,
		);
		const durationInFrames = segmentEnd - segmentStart;
		if (durationInFrames <= 0) {
			continue;
		}

		segments.push({
			loopIndex,
			absoluteOffsetInFrames: segmentStart,
			loopOffsetInFrames: segmentStart - loopStartInFrames,
			durationInFrames,
		});
	}

	return segments;
};

export const getLoopDisplayWidth = ({
	visualizationWidth,
	loopDisplay,
}: {
	visualizationWidth: number;
	loopDisplay: TimelineLoopDisplay | undefined;
}) => {
	if (!shouldTileLoopDisplay(loopDisplay)) {
		return visualizationWidth;
	}

	return visualizationWidth / loopDisplay.numberOfTimes;
};
