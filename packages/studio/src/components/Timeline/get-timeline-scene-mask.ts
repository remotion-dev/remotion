import type {TimelineSceneRange} from './timeline-series-layout';

export const getTimelineSceneMask = ({
	sceneRange,
	durationInFrames,
	offsetInFrames,
}: {
	readonly sceneRange: TimelineSceneRange | null;
	readonly durationInFrames: number;
	readonly offsetInFrames: number;
}): string | undefined => {
	if (
		sceneRange === null ||
		durationInFrames <= 0 ||
		(sceneRange.fadeInEnd === null && sceneRange.fadeOutStart === null)
	) {
		return undefined;
	}

	const stops: string[] = [];
	for (const direction of ['in', 'out'] as const) {
		const boundary =
			direction === 'in' ? sceneRange.fadeInEnd : sceneRange.fadeOutStart;
		if (boundary === null) {
			stops.push(direction === 'in' ? 'black 0%' : 'black 100%');
			continue;
		}

		const from =
			direction === 'in'
				? sceneRange.from
				: Math.max(sceneRange.from, boundary);
		const end =
			direction === 'in' ? Math.min(sceneRange.end, boundary) : sceneRange.end;
		// Approximate smootherstep with gradual stops so neither end
		// has an abrupt change in the gradient's slope.
		for (let step = 0; step <= 8; step++) {
			const progress = step / 8;
			const eased = progress ** 3 * (progress * (progress * 6 - 15) + 10);
			const alpha = direction === 'in' ? eased : 1 - eased;
			const position =
				((from + (end - from) * progress - offsetInFrames) / durationInFrames) *
				100;
			stops.push(`rgba(0, 0, 0, ${alpha}) ${position}%`);
		}
	}

	return `linear-gradient(to right, ${stops.join(', ')})`;
};
